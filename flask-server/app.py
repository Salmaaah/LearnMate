import os
from dotenv import load_dotenv
import json
from flask import Flask, session, request, jsonify, send_from_directory, Response, stream_with_context
from flask_session import Session
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import magic
from pypdf import PdfReader
from openai import OpenAI, APIError, APIConnectionError, RateLimitError
from validator_collection import is_email
from models import db, User, File, Subject, Tag, Project, Note
from flask_migrate import Migrate
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from helpers import login_required, logout_required


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
                return jsonify({"error": "File already exists"}), 400

            # Validate file type
            file_type = magic.from_buffer(file.read(2048), mime=True)  
            file.seek(0)  # Move file pointer back to the start

            if "executable" in file_type.lower():
                return jsonify({"error": "Executable files are not allowed"}), 400

            # Create user folder if it doesn't exist
            user_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{user_id}")
            os.makedirs(user_folder, exist_ok=True)

            # Save file to user folder
            file_path = os.path.join(user_folder, filename)
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


# @uploaded_files_bp.route("/files", methods=["GET"])
@login_required
@app.route("/data", methods=["GET"])
def get_user_data():
    user = User.query.filter_by(id=session["user_id"]).first()

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
                    "modified_date" : note.modified_date,
                } 
                for note in file.notes
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
    
    tags = user.tags
    tags_list = [
        {
            "id": tag.id,
            "name": tag.name,
            "color": tag.color,
        }
        for tag in tags
    ]
    
    return jsonify({"files": file_list, "subjects": subjects_list, "projects": projects_list, "notes": notes_list, "tags": tags_list}), 200


@login_required
@app.route("/files/<file_id>")
def serve_file(file_id):
    file = db.session.get(File, file_id)

    if file:
        directory = os.path.join(app.config["UPLOADED_FILES_DEST"], f'user_{session["user_id"]}')
        return send_from_directory(directory, file.name)
    else:
        return jsonify({"error": "File not found"}), 404


@login_required
@app.route("/update/<file_id>", methods=["POST"])
def update_file(file_id):
    file = File.query.filter_by(id=file_id).first()
    data = request.json

    if file:
        file_name = data.get("name").strip()
        # file_subject = data.get("subject")
        # file_project = data.get("project")
        # file_tags = data.get("tags")
        
        # Server-side validation
        if not file_name:
            return jsonify({"error": "File name must be at least 1 character long."}), 400
        if file_name.startswith("."):
            return jsonify({"error": "File name cannot start with a period."}), 400

        try:
            # update file in user folder
            user_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{session['user_id']}")
            os.rename(os.path.join(user_folder, file.name), os.path.join(user_folder, file_name))

            # update file in database
            file.name = file_name
            # file.subject_id = file_subject
            # file.project_id = file_project
            # file.tags = file_tags
            db.session.commit()


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
        user_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{session['user_id']}")
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
    file_id = data.get("file_id")
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
        file_id = data.get("file_id")
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
                return jsonify({"error": f"{property_type} name must be at least 1 character long."}), 400

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
                return jsonify({"error": {"name": f"{property_type} name already exists."}}), 400

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

    if note_name is None:
        untitled_notes = Note.query.filter(Note.name.like("%Untitled note%")).all()

        if len(untitled_notes) == 0 or all([note.name != "Untitled note" for note in untitled_notes]):
                note_num = ""
        else:
            # leave only the untitled notes with numbers
            untitled_notes = [note.name for note in untitled_notes if note.name !="Untitled note" and "Untitled note" in note.name]
            # extract and sort the existing numbers used in the untitled notes
            nums = sorted([int(note.replace('Untitled note ', '')) for note in untitled_notes])

            expected_num = 2
            for num in nums:
                if num != expected_num:
                    note_num = " " + str(expected_num)
                    break
                expected_num += 1
            note_num = " " + str(expected_num)

        note_name="Untitled note" + note_num
        
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
@app.route("/askAI/<keyword>/<file_id>", methods=["POST"])
def askAI(keyword, file_id):
    # Retrieve file content from the database
    file = File.query.filter_by(id=file_id).first()
    if file is None:
        return jsonify({'error': 'File not found'}), 404
    
    text = file.content
    if text == "Error reading file":
        return jsonify({"error": "File content not available"}), 400
    
    if keyword == "summarize":
        prompt = "Using Markdown format, generate a <Subject> heading and structured summary of the provided text. Organize the key concepts into concise sections and use bite-sized bullet points to highlight important details within each section: "
    elif keyword == "write":
        prompt = ""
    else:
        prompt = keyword
    
    # TODO: Create prompts for other keywords

    # Make request to OpenAI API
    try:
        # stream = client.chat.completions.create(
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "user", 
                "content": prompt + text,
            }],
            # stream=True,
            # max_tokens=150,
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

if __name__ == "__main__":
    app.run(debug=True)
