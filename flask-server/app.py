import os
from dotenv import load_dotenv
import json
from flask import Flask, session, request, jsonify, send_file, Response, stream_with_context
from flask_session import Session
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import magic
from pypdf import PdfReader
from openai import OpenAI, APIError, APIConnectionError, RateLimitError
from validator_collection import is_email
from models import db, User, File, Subject, Tag, Project, Note, FlashcardDeck, Flashcard, Todo
from flask_migrate import Migrate
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from helpers import login_required, logout_required, generate_untitled_name


# Configure application
app = Flask(__name__)
CORS(app, origins="http://localhost:3000")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure Flask-SQLAlchemy to use SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///learnmate.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # Disable modification tracking
db.init_app(app)
migrate = Migrate()
migrate.init_app(app, db)

# Create database tables
with app.app_context():
    db.create_all()

load_dotenv()

# Initialize OpenAI client
client = OpenAI(
  organization=os.getenv("OPENAI_ORGANIZATION"),
  project=os.getenv("OPENAI_PROJECT"),
  api_key=os.getenv("OPENAI_API_KEY"),
)

@logout_required
@app.route("/")
def index():
    """Show landing page"""

    return "Index"


@app.route("/signup", methods=["GET", "POST"])
@logout_required
def signup():
    """Create new user account"""

    if request.method == "POST":
        data = request.json
        username = data.get("username").strip().lower()
        email = data.get("email").strip().lower()
        password = data.get("password")
        confirmPassword = data.get("confirmPassword")

        # Server-side validation
        errors = {}

        if not username or len(username) < 5:
            errors["username"] = "Username must be at least 5 characters long."

        if not email or not is_email(email):
            errors["email"] = "Invalid email format."

        if not password or len(password) < 8:
            errors["password"] = "Password must be at least 8 characters long."

        if not confirmPassword or password != confirmPassword:
            errors["confirmPassword"] = "Passwords do not match."

        if errors:
            return jsonify({"error": errors}), 400

        try:
            # Add new user to database
            new_user = User(
                username=username,
                email=email,
                password=generate_password_hash(password),
            )
            db.session.add(new_user)
            db.session.commit()

            # Remember which user has logged in
            session["user_id"] = User.query.filter_by(username=username).first().id

            user_info = {
                "username": username,
                "email": email,
            }

            return (
                jsonify({"message": "User created successfully", "user": user_info}),
                201,
            )

        except IntegrityError as e:
            db.session.rollback()
            if "UNIQUE constraint failed: users.username" in str(e.orig):
                errors["username"] = "Username already exists."
                return jsonify({"error": errors}), 400

            elif "UNIQUE constraint failed: users.email" in str(e.orig):
                errors["email"] = "Email already exists."
                return jsonify({"error": errors}), 400

            else:
                return jsonify({"error": str(e)}), 400

    return jsonify({"message": "Sign up page loaded successfully"}), 200


@app.route("/login", methods=["GET", "POST"])
@logout_required
def login():
    """User login"""

    if request.method == "POST":
        data = request.json
        identifier = data.get("identifier").strip().lower()
        password = data.get("password")

        # Server-side validation
        errors = {}

        is_username = "@" not in identifier
        is_email = "@" in identifier
 
        filter_criteria = or_(
            User.username == identifier if is_username else False,
            User.email == identifier if is_email else False,
        )
        user = User.query.filter(filter_criteria).first()

        if not identifier:
            errors["identifier"] = (
                "Invalid username. Please try again."
                if is_username
                else "Invalid email address. Please try again."
            )

        elif user is None:
            errors["identifier"] = f"There is no LearnMate account associated with {identifier}. Please try again."

        elif len(password) < 8 or not check_password_hash(user.password, password):
            errors["password"] = "Incorrect password. Please try again."

        if errors:
            return jsonify({"error": errors}), 400

        # Login successful
        session["user_id"] = user.id

        user_info = {
            "username": user.username,
            "email": user.email,
        }

        return jsonify({"message": "Login successful", "user": user_info}), 200

    return jsonify({"message": "Login page loaded successfully"}), 200


@app.route("/terms")
@logout_required
def terms():
    """Terms and Conditions"""
    return jsonify({"message": "Terms & Conditions page loaded successfully"}), 200


@app.route("/privacy")
@logout_required
def privacy():
    """Privacy Policy"""
    return jsonify({"message": "Privacy Policy page loaded successfully"}), 200


@app.route("/logout", methods=["POST"])
def logout():
    """Log user out"""
    # Forget any user_id
    session.clear()

    if session.get("user_id") is not None:
        return jsonify({"error": "Logout failed"}), 400

    return jsonify({"message": "User logged out successfully"}), 200


@app.route("/dashboard")
@login_required
def dashboard():
    """Show user dashboard"""

    return jsonify({"message": "Dashboard loaded successfully"}), 200


# Mock data for suggestions
suggestions_data = [
    {"label": "Home", "link": "/", "favicon": ""},
    {"label": "About Us", "link": "/about", "favicon": ""},
    {"label": "Contact", "link": "/contact", "favicon": ""},
    {"label": "Products", "link": "/products", "favicon": ""},
    {"label": "Services", "link": "/services", "favicon": ""},
]

# TODO: Remove api/ from route
@app.route("/api/search", methods=["GET"])
def search():
    query = request.args.get("query", "").lower()

    # Filter suggestions based on the query
    filtered_suggestions = [
        {"label": suggestion["label"], "link": suggestion["link"]}
        for suggestion in suggestions_data
        if query in suggestion["label"].lower()
    ]

    # Return the filtered suggestions
    return jsonify({"items": filtered_suggestions})


@app.route("/courses")
@login_required
def courses():
    return jsonify({"message": "Courses page loaded successfully"}), 200


@app.route("/learn/<id>")
@login_required
def learn(id):
    return jsonify({"message": f"Learning page {id} loaded successfully"}), 200


# Configure file upload destination
app.config["UPLOADED_FILES_DEST"] = "uploads"


@login_required
@app.route("/upload", methods=["POST"])
def upload_files():
    """Upload files to server"""
    
    files = request.files.getlist("files")
    if files:
        for file in files:
            # Sanitize file name to prevent security vulnerabilities like directory traversal attacks
            filename = secure_filename(file.filename)
            user_id = session["user_id"]
            
            existing_file = File.query.filter_by(name=filename, user_id=user_id).first()

            if filename == "":
                return jsonify({"error": "Problem generating secure file name"}), 400
            
            if existing_file:
                # TODO: I should rename the file instead of triggering an error like how I've done with notes
                # or I can trigger a pop up to ask whether to rename or replace existing file or to cancel upload
                return jsonify({"error": "File already exists"}), 400

            # Validate file type
            file_type = magic.from_buffer(file.read(2048), mime=True)  
            file.seek(0)  # Move file pointer back to the start

            if "executable" in file_type.lower():
                return jsonify({"error": "Executable files are not allowed"}), 400

            # Create user folder if it doesn't exist
            user_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{user_id}")
            os.makedirs(user_folder, exist_ok=True)

            # Create subfolder for files if it doesn't exist
            user_files_folder = os.path.join(user_folder, "files")
            os.makedirs(user_files_folder, exist_ok=True)

            # Save file to user folder
            file_path = os.path.join(user_files_folder, filename)
            file.save(file_path)

            # Extract file content
            try:
                if "pdf" in file_type.lower():
                    # TODO: find a better pdf to text converter 
                    file_content = extract_text_from_pdf(file)

                else:
                    #text, code, markup, and data files
                    with open(file_path, 'r') as f:
                        file_content = f.read()

            except Exception:
                    file_content = "Error reading file"


            # Save file information to the database
            new_file = File(
                name=filename,
                type=file_type,
                user_id=user_id,
                path=file_path,
                content=file_content,
            )
            db.session.add(new_file)

        db.session.commit()

        return jsonify({"message": "Files uploaded successfully"}), 200
    else:
        return jsonify({"error": "No files provided"}), 400

def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    text = ''
    for page_num in range(reader.get_num_pages()):
        text += reader.get_page(page_num).extract_text()
        # extract text in a fixed width format that closely adheres to the rendered layout in the source pdf 
        # extract_text(extraction_mode="layout")

        # extract text preserving horizontal positioning without excess vertical whitespace (removes blank and "whitespace only" lines)
        # extract_text(extraction_mode="layout", layout_mode_space_vertically=False)

        # adjust horizontal spacing
        # extract_text(extraction_mode="layout", layout_mode_scale_weight=1.0)

        # exclude (default) or include (as shown below) text rotated w.r.t. the page
        # extract_text(extraction_mode="layout", layout_mode_strip_rotated=False)

    return text.strip()


@login_required
@app.route("/data", methods=["GET"])
def get_user_data():
    user = User.query.filter_by(id=session["user_id"]).first()
    
    username = user.username

    files = user.files
    file_list = [
        {
            "id": file.id,
            "name": file.name,
            "type": file.type,
            #  "path": file.path,
            "content": file.content,
            "created_at": file.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "subject": [{
                "id": file.subject.id,
                "name": file.subject.name,
                "color": file.subject.color,
            }]
            if file.subject
            else [],
            "project": [{
                "id": file.project.id,
                "name": file.project.name,
                "color": file.project.color,
            }]
            if file.project
            else [],
            "notes": [
                {
                    "id": note.id,
                    "name": note.name,
                    "content": json.loads(note.content) if note.content is not None else '',
                    "modified_at" : note.modified_at,
                    "table": Note.__tablename__,
                } 
                for note in file.notes
            ],
            "flashcard_decks": [
                {
                    "id": flashcard_deck.id,
                    "name": flashcard_deck.name,
                    "description": flashcard_deck.description,
                    "modified_at": flashcard_deck.modified_at,
                    "last_reviewed_at": flashcard_deck.last_reviewed_at,
                    "flashcards": [
                        {
                            "id": flashcard.id,
                            "term": flashcard.term,
                            "definition": flashcard.definition,
                            "order": flashcard.order,
                            "imagePath": flashcard.image_path,
                        } 
                        for flashcard in flashcard_deck.flashcards
                    ],
                    "table": FlashcardDeck.__tablename__,
                } 
                for flashcard_deck in file.flashcard_decks
            ],
            "todos": [
                {
                    "id": todo.id,
                    "content": todo.content,
                    "done": todo.done,
                    "order": todo.order,
                } 
                for todo in file.todos
            ],            
            "tags": [
                {
                    "id": tag.id,
                    "name": tag.name,
                    "color": tag.color,
                } 
                for tag in file.tags
            ],
        }
        for file in files
    ]
    
    subjects = user.subjects
    subjects_list = [
        {
            "id": subject.id,
            "name": subject.name,
            "color": subject.color,
        }
        for subject in subjects
    ]

    projects = user.projects
    projects_list = [
        {
            "id": project.id,
            "name": project.name,
            "color": project.color,
        }
        for project in projects
    ]

    notes = user.notes
    notes_list = [
        {
            "id": note.id,
            "name": note.name,
            "content": note.content,
        }
        for note in notes
    ]

    flashcard_decks = user.flashcard_decks
    flashcard_decks_list = [
        {
            "id": flashcard_deck.id,
            "name": flashcard_deck.name,
            "description": flashcard_deck.description,
            "modified_at": flashcard_deck.modified_at,
            "last_reviewed_at": flashcard_deck.last_reviewed_at,
            "flashcards": [
                {
                    "id": flashcard.id,
                    "term": flashcard.term,
                    "definition": flashcard.definition,
                    "order": flashcard.order,
                    "imagePath": flashcard.image_path,
                } 
                for flashcard in flashcard_deck.flashcards
            ],
        }
        for flashcard_deck in flashcard_decks
    ]

    flashcards = user.flashcards
    flashcards_list = [
        {
            "id": flashcard.id,
            "term": flashcard.term,
            "definition": flashcard.definition,
            "order": flashcard.order,
            "imagePath": flashcard.image_path,
        } 
        for flashcard in flashcards
    ]

    todos = user.todos
    todos_list = [
        {
            "id": todo.id,
            "content": todo.content,
            "done": todo.done,
            "order": todo.order,
        }
        for todo in todos
    ]

    tags = user.tags
    tags_list = [
        {
            "id": tag.id,
            "name": tag.name,
            "color": tag.color,
        }
        for tag in tags
    ]
    
    return jsonify({"username": username, "files": file_list, "subjects": subjects_list, "projects": projects_list, "notes": notes_list, "flashcard_decks": flashcard_decks_list, "flashcards": flashcards_list, "todos": todos_list, "tags": tags_list}), 200


@login_required
@app.route("/files/<file_id>")
def serve_file(file_id):
    file = db.session.get(File, file_id)

    if file:
        return send_file(file.path)
    else:
        return jsonify({"error": "File not found"}), 404


@login_required
@app.route("/updateName/<file_id>", methods=["POST"])
def update_fileName(file_id):
    file = File.query.filter_by(id=file_id).first()
    data = request.json

    if file:
        file_name = data.get("name").strip()
        
        # Server-side validation
        if not file_name:
            return jsonify({"error": "File name must be at least 1 character long."}), 400
        if file_name.startswith("."):
            return jsonify({"error": "File name cannot start with a period."}), 400

        try:
            # Define paths
            user_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{session['user_id']}", "files")
            old_path = os.path.join(user_folder, file.name)
            new_path = os.path.join(user_folder, file_name)

            # update file in database
            file.name = file_name
            file.path = new_path
            db.session.commit()

            # update file in user folder after successful database update
            os.rename(old_path, new_path)

            return jsonify({"message": "File updated successfully"}), 200
        
        except IntegrityError as e:
            db.session.rollback()
            if f"UNIQUE constraint failed: file.name" in str(e.orig):
                return jsonify({"error": "File name already exists."}), 400

            else:
                return jsonify({"error": str(e)}), 400

    else:
        return jsonify({"error": "File not found"}), 404


@login_required
@app.route("/delete/<file_id>", methods=["POST"])
def delete_file(file_id):
    file = File.query.filter_by(id=file_id).first()

    if file:
        # delete file from user folder
        user_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{session['user_id']}", "files")
        os.remove(os.path.join(user_folder, file.name))

        # delete file from database
        db.session.delete(file)
        db.session.commit()

        return jsonify({"message": "File deleted successfully"}), 200

    else:
        return jsonify({"error": "File not found"}), 404


@login_required
@app.route("/addProperty/<property_type>/<property_id>", methods=["POST"])
def add_property(property_type, property_id):

    property_models = {
        'Subject': Subject,
        'Project': Project,
        'Tag': Tag,
        'Note': Note,
    }

    PropertyModel = property_models.get(property_type)
    property = PropertyModel.query.filter_by(id=property_id).first()
    data = request.json

    # Create property if it does not exist already (notes are excluded from this logic)
    if not property:
        property_name = data.get("name").strip()
        property_color = data.get("color").strip()

        # Server-side validation
        if not property_name:
            return jsonify({"error": f"{property_type} name must be at least 1 character long."}), 400

        # Add new property to database
        try:
            new_property = PropertyModel(
                name=property_name,
                color=property_color,
                user_id=session["user_id"],
            )
            db.session.add(new_property)
            db.session.commit()

            property = new_property
        
        except IntegrityError as e:
            db.session.rollback()
            if f"UNIQUE constraint failed: {property_type.lower()}.name" in str(e.orig):
                return jsonify({"error": f"{property_type} name already exists."}), 400

            else:
                return jsonify({"error": str(e)}), 400

    # Add property to file
    file_id = data.get("fileId")
    file = File.query.filter_by(id=file_id).first()
    
    if property_type == 'Subject':
        file.subject = property
    elif property_type == 'Project':
        file.project = property
    elif property_type == 'Tag':
        if property not in file.tags:
            file.tags.append(property)
    elif property_type == 'Note':
        if property not in file.notes:
            file.notes.append(property)
    
    db.session.commit()

    return jsonify({"message": f"{property_type} created and/or added successfully"}), 200


@login_required
@app.route("/removeProperty/<property_type>/<property_id>", methods=["POST"])
def remove_property(property_type, property_id):

    property_models = {
        'Subject': Subject,
        'Project': Project,
        'Tag': Tag,
        'Note': Note,
    }

    PropertyModel = property_models.get(property_type)
    property = PropertyModel.query.filter_by(id=property_id).first()
    data = request.json

    if property:
        file_id = data.get("fileId")
        file = File.query.filter_by(id=file_id).first()
        
        if property_type == 'Subject':
            file.subject = None
        elif property_type == 'Project':
            file.project = None 
        elif property_type == 'Tag':
            file.tags.remove(property)
        elif property_type == 'Note':
            file.notes.remove(property)

        db.session.commit()

        return jsonify({"message": f"{property_type} removed successfully"}), 200

    else:
        return jsonify({"error": f"{property_type} {data.get("name")} not found"}), 404


@login_required
@app.route("/updateProperty/<property_type>/<property_id>", methods=["POST"])
def update_property(property_type, property_id):

    property_models = {
        'Subject': Subject,
        'Project': Project,
        'Tag': Tag,
    }

    PropertyModel = property_models.get(property_type)
    property = PropertyModel.query.filter_by(id=property_id).first()
    data = request.json

    if property:

        if "name" in data:
            property_name = data.get("name").strip()
            
            # Server-side validation
            if not property_name:
                return jsonify({"error": "Name can't be empty."}), 400

            # Update property name in database
            property.name = property_name

        else:
            property_color = data.get("color").strip()

            # Update property color in database
            property.color = property_color

        try:            
            db.session.commit()
            return jsonify({"message": f"{property_type} updated successfully"}), 200
        
        except IntegrityError as e:
            db.session.rollback()
            if f"UNIQUE constraint failed: {property_type.lower()}.name" in str(e.orig):
                return jsonify({"error": f"{property_type} name already exists."}), 400

            else:
                return jsonify({"error": str(e)}), 400

    else:
        return jsonify({"error": f"{property_type} {property_name} not found"}), 404


@login_required
@app.route("/deleteProperty/<property_type>/<property_id>", methods=["POST"])
def delete_property(property_type, property_id):

    property_models = {
        'Subject': Subject,
        'Project': Project,
        'Tag': Tag,
    }

    PropertyModel = property_models.get(property_type)
    property = PropertyModel.query.filter_by(id=property_id).first()

    if property:
        db.session.delete(property)
        db.session.commit()

        return jsonify({"message": f"{property_type} deleted successfully"}), 200

    else:
        return jsonify({"error": f"{property_type} not found"}), 404


@login_required
@app.route('/createNote/<file_id>', defaults={'note_name': None}, methods=["POST"])
@app.route('/createNote/<file_id>/<note_name>', methods=["POST"])
def create_note(file_id, note_name=None):

    # Generate note name if not provided
    if note_name is None:
        note_name = generate_untitled_name('note')
        
    # Add new note to database
    try:
        new_note = Note(
            name=note_name,
            user_id=session["user_id"],
            file_id=file_id,
        )
        db.session.add(new_note)
        db.session.commit()

        note_data = {
            "id": new_note.id,
            "name": new_note.name,
            "content": new_note.content
        }

        return jsonify({"message": "Note created successfully", "note": note_data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@login_required
@app.route("/updateNote/<note_id>/<element>", methods=["POST"])
def update_note(note_id, element):

    note = Note.query.filter_by(id=note_id).first()
    data = request.json.get("value")
    
    if element == "name":
        note.name = data.strip()
    else:
        note.content = json.dumps(data)

    note_data = {
        "id": note.id,
        "name": note.name,
        "content": json.loads(note.content) if note.content is not None else '',
    }

    try:
        db.session.commit()
        return jsonify({"message": "Note updated successfully", "note": note_data}), 200
    
    except IntegrityError as e:
        db.session.rollback()
        if f"UNIQUE constraint failed: note.name" in str(e.orig):
            return jsonify({"error": {"name": f"note name already exists."}}), 400

        else:
            return jsonify({"error": str(e)}), 400


@login_required
@app.route("/deleteNote/<note_id>", methods=["POST"])
def delete_note(note_id):
    
    note = Note.query.filter_by(id=note_id).first()
    db.session.delete(note)

    try:
        db.session.commit()
        return jsonify({"message": "Note deleted successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@login_required
@app.route('/askAI/<context>/<keyword>', methods=["POST"])
def askAI(context, keyword):
    data = request.json
    prompt = ""

    if context == "Notes" :
        note_content = ""
        file_content = ""   

        if keyword in ['summarize', 'continue']:
            # Retrieve file content from the database
            id = data.get("fileId")
            file = File.query.filter_by(id=id).first()
            if file is None:
                return jsonify({'error': 'File not found'}), 404
            
            file_content = file.content
            if file_content == "Error reading file":
                return jsonify({"error": "File content not available"}), 400
        
            file_content = "\nMaterial:\n" + file_content
        
        if keyword in ['continue', 'improve']:
            # Retrieve user notes from database
            notes = data.get("notes")
            note_content = "\nNotes:\n" + notes
    
        if keyword == "summarize": # uses file content as input
            prompt = "Using Markdown format, generate a \"<Subject> Overview\" heading 2 and structured summary of the provided text. Organize the key concepts into concise sections of heading 3 and use bite-sized bullet points to highlight important details within each section: "  + file_content
        elif keyword == "continue": # uses file  and note contents as input
            prompt = "One of the following two texts is a study material and the other is some unfinished notes on that material. Your task is to accurately predict the rest of the notes. Do not add any information that does not exist in the original study material." + file_content + note_content
        elif keyword == "improve": # uses only note content as input
            prompt = "Improve writing." + note_content
        elif keyword == "custom": # case when the user input is the prompt
            prompt = data.get("prompt")
    
    elif context == "Flashcards":
        if keyword == "multigen":
            id = data.get("fileId")
            file = File.query.filter_by(id=id).first()
            
            if file is None:
                return jsonify({'error': 'File not found'}), 404
            
            file_content = file.content
            
            if file_content == "Error reading file":
                return jsonify({"error": "File content not available"}), 400
        
            prompt = "Generate mixed types of flashcards (e.g., definitions, applications, True False, Multi Choice, Fill in the Blank, etc.) from the following text using this format: \nF: <Front>\nB: <Back>\nUse only information provided by the text. text: " + file_content

        elif keyword == "predict":
            id = data.get("flashcardId")
            flashcard = Flashcard.query.filter_by(id=id).first()
            
            if flashcard is None:
                return jsonify({'error': 'Flashcard not found'}), 404
            
            side = flashcard.term + flashcard.definition
            prompt = "Predict the other answer to this flashcard, give the answer only: " + side
        
        else:
            custom_prompt = data.get("prompt")
            prompt = "Create one flashcard to the following prompt. Organize your response using term and definition distinctions. prompt: " + custom_prompt

    # Make request to OpenAI API
    try:
        # stream = client.chat.completions.create(
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "user", 
                "content": prompt,
            }],
            # stream=True,
            max_tokens=200,
        )

    # Handle OpenAI API errors
    except RateLimitError as e:
        return jsonify({'error': f'OpenAI API request exceeded rate limit: {e}'}), 429
    
    except APIConnectionError as e:
        return jsonify({'error': f'Failed to connect to OpenAI API: {e}'}), 500
    
    except APIError as e:
        return jsonify({'error': f'OpenAI API returned an API Error: {e}'}), 500
    
    # Handle other exceptions
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    return jsonify({'message': completion.choices[0].message.content}), 200

    # def generate_chunks():
    #     # Yield each chunk from the stream
    #     for chunk in stream:
    #         if chunk.choices[0].delta.content is not None:
    #             yield chunk.choices[0].delta.content
    
    # # Stream AI response chunks to client
    # return Response(stream_with_context(generate_chunks()), status=200, content_type='text/plain')


@login_required
@app.route('/createFlashcardDeck/<file_id>', methods=["POST"])
def create_flashcard_deck(file_id):

    # Add new deck to database
    try:
        new_deck = FlashcardDeck(
            name=generate_untitled_name('deck'),
            user_id=session["user_id"],
            file_id=file_id,
        )
        db.session.add(new_deck)
        db.session.commit()

        deck = {
            "id": new_deck.id,
            "name": new_deck.name,
            "description": new_deck.description,
        }

        return jsonify({"message": "Flashcard deck created successfully", "flashcard_deck": deck}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@login_required
@app.route("/deleteFlashcardDeck/<deck_id>", methods=["POST"])
def delete_flashcard_deck(deck_id):
    deck = FlashcardDeck.query.filter_by(id=deck_id).first()

    if deck:
        # Delete flashcards in the deck
        flashcards = Flashcard.query.filter_by(deck_id=deck_id).order_by(Flashcard.order).all()

        for flashcard in flashcards:
            delete_flashcard(flashcard.id, True)

        # delete flashcard deck from database
        db.session.delete(deck)
        db.session.commit()

        return jsonify({"message": "Flashcard deck deleted successfully"}), 200

    else:
        return jsonify({"error": "Flashcard deck not found"}), 404


@login_required
@app.route('/createFlashcard/<deck_id>/<order>', methods=["POST"])
def create_flashcard(deck_id, order):
    try:
        new_flashcard = Flashcard(
            order=order,
            term='',
            definition='',
            user_id=session["user_id"],
            deck_id=deck_id,
        )
        db.session.add(new_flashcard)
        db.session.commit()

        flashcard_data = {
            "id": new_flashcard.id,
            "order": new_flashcard.order,
        }

        return jsonify({"message": "Flashcard created successfully", "flashcard": flashcard_data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@login_required
@app.route("/updateFlashcard/<flashcard_id>", methods=["POST"])
def update_flashcard(flashcard_id):
    flashcard = Flashcard.query.filter_by(id=flashcard_id).first()
    data = request.json

    if flashcard:
        try:
            # update flashcard in database
            if "term" in data:
                flashcard.term = data["term"].strip()
            
            if "definition" in data:
                flashcard.definition = data["definition"].strip()

            if "order" in data:
                flashcard.order = data["order"]
            
            db.session.commit()

            return jsonify({"message": "Flashcard updated successfully"}), 200
        
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    else:
        return jsonify({"error": "Flashcard not found"}), 404


@login_required
@app.route('/uploadFlashcardImage/<flashcard_id>', methods=["POST"])
def upload_flashcard_image(flashcard_id):
    flashcard = Flashcard.query.filter_by(id=flashcard_id).first()
    image = request.files.getlist("image")[0]

    if flashcard:
        # Create subfolder for files if it doesn't exist
        flashcards_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{session['user_id']}", "flashcards")
        os.makedirs(flashcards_folder, exist_ok=True)

        # Get filename and extension
        filename = secure_filename(image.filename)

        if filename == "":
            return jsonify({"error": "Problem generating secure file name"}), 400 
    
        _, ext = os.path.splitext(filename)

        try:   
            # Save image to flashcards folder using flashcard_id as its name
            image_path = os.path.join(flashcards_folder, f"{flashcard_id}{ext}")
            image.save(image_path)

            # Save image path to the flashcard database
            flashcard.image_path = image_path
            db.session.commit()

            return jsonify({"message": "Flashcard image uploaded successfully"}), 200
    
        except Exception as e:
            return jsonify({"error": str(e)}), 400
                
    else:
        return jsonify({"error": "No image provided"}), 400


@login_required
@app.route("/getFlashcardImage/<flashcard_id>")
def serve_image(flashcard_id):
    flashcard = db.session.get(Flashcard, flashcard_id)

    if flashcard:
        return send_file(flashcard.image_path)
    else:
        return jsonify({"error": "Image file not found"}), 404


@login_required
@app.route("/deleteFlashcardImage/<flashcard_id>", methods=["POST"])
def delete_image(flashcard_id):
    flashcard = Flashcard.query.filter_by(id=flashcard_id).first()

    if flashcard:
        try:
            # delete flashcard image from folder
            if flashcard.image_path:
                os.remove(flashcard.image_path)

            # reset image_path
            flashcard.image_path = None
            db.session.commit()

            return jsonify({"message": "Flashcard image deleted successfully"}), 200
    
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    else:
        return jsonify({"error": "Flashcard not found"}), 404


@login_required
@app.route("/deleteFlashcard/<flashcard_id>", methods=["POST"])
def delete_flashcard(flashcard_id, batch_deletion=False):
    flashcard = Flashcard.query.filter_by(id=flashcard_id).first()

    if flashcard:
        # Save deck_id to extract remaining_flashcards later
        deck_id = flashcard.deck_id

        # delete flashcard image from folder if it exists
        if flashcard.image_path:
            os.remove(flashcard.image_path)

        # delete flashcard from database
        db.session.delete(flashcard)

        if not batch_deletion:
            # Update order of remaining flashcards in the same deck
            remaining_flashcards = Flashcard.query.filter_by(deck_id=deck_id).order_by(Flashcard.order).all()
            
            for index, card in enumerate(remaining_flashcards):
                card.order = index + 1
                db.session.add(card)
        
            db.session.commit()

        return jsonify({"message": "Flashcard deleted successfully"}), 200

    else:
        return jsonify({"error": "Flashcard not found"}), 404


@login_required
@app.route('/createTodo/<file_id>/<order>', methods=["POST"])
def create_todo(file_id, order):
    try:
        new_todo = Todo(
            order=order,
            content='',
            user_id=session["user_id"],
            file_id=file_id,
        )
        db.session.add(new_todo)
        db.session.commit()

        todo_data = {
            "id": new_todo.id,
            "order": new_todo.order,
        }

        return jsonify({"message": "Todo created successfully", "todo": todo_data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@login_required
@app.route("/updateTodo/<todo_id>", methods=["POST"])
def update_todo(todo_id):
    todo = Todo.query.filter_by(id=todo_id).first()
    data = request.json

    if todo:
        try:
            # update todo in database
            if "content" in data:
                todo.content = data["content"].strip()
            if "done" in data:
                todo.done = data["done"]
            if "order" in data:
                todo.order = data["order"]
            
            db.session.commit()

            return jsonify({"message": "Todo updated successfully"}), 200
        
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    else:
        return jsonify({"error": "Todo not found"}), 404


@login_required
@app.route("/deleteTodo/<todo_id>", methods=["POST"])
def delete_todo(todo_id):
    todo = Todo.query.filter_by(id=todo_id).first()

    if todo:
        # Save file_id to extract remaining_todos later
        file_id = todo.file_id

        # delete todo from database
        db.session.delete(todo)
        db.session.commit()

        # Update order of remaining todos
        remaining_todos = Todo.query.filter_by(file_id=file_id).order_by(Todo.order).all()
        
        for index, item in enumerate(remaining_todos):
            item.order = index + 1
            db.session.add(item)
        db.session.commit()

        return jsonify({"message": "Todo deleted successfully"}), 200

    else:
        return jsonify({"error": "Todo not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
