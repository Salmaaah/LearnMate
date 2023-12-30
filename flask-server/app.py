import os
from flask import Flask, session, request, jsonify, send_from_directory
from flask_session import Session
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import magic
from validator_collection import is_email
from models import db, User, File, Subject, Tag
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

# Create database tables
with app.app_context():
    db.create_all()


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
            return jsonify({"message": "Validation failed", "errors": errors}), 400

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
                return jsonify({"message": str(e), "errors": errors}), 400

            elif "UNIQUE constraint failed: users.email" in str(e.orig):
                errors["email"] = "Email already exists."
                return jsonify({"message": str(e), "errors": errors}), 400

            else:
                return jsonify({"message": str(e)}), 400

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
            return jsonify({"message": "Validation failed", "errors": errors}), 400

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


# Configure file upload destination
app.config["UPLOADED_FILES_DEST"] = "uploads"


@login_required
@app.route("/upload", methods=["POST"])
def upload_files():
    """Upload files to server"""
    user = User.query.filter_by(id=session["user_id"]).first()

    if user:
        files = request.files.getlist("files")
        if files:
            for file in files:
                # Sanitize filename to prevent security vulnerabilities like directory traversal attacks
                filename = secure_filename(file.filename)
                
                existing_file = File.query.filter_by(filename=filename, user_id=user.id).first()

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
                user_folder = os.path.join(app.config["UPLOADED_FILES_DEST"], f"user_{user.id}")
                os.makedirs(user_folder, exist_ok=True)

                # Save file to user folder
                file_path = os.path.join(user_folder, filename)
                file.save(file_path)

                # Save file information to the database
                new_file = File(
                    filename=filename,
                    file_type=file_type,
                    user_id=user.id,
                    path=file_path,
                )
                db.session.add(new_file)

            db.session.commit()

            return jsonify({"message": "Files uploaded successfully"}), 200
        else:
            return jsonify({"error": "No files provided"}), 400
    else:
        return jsonify({"error": "User not authenticated"}), 401


# @uploaded_files_bp.route("/files", methods=["GET"])
@login_required
@app.route("/files", methods=["GET"])
def get_user_files():
    user = User.query.filter_by(id=session["user_id"]).first()
    if user:
        files = user.files
        file_list = [
            {
                "id": file.id,
                "filename": file.filename,
                "file_type": file.file_type,
                #  "path": file.path,
                "created_at": file.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "subject": {
                    "id": file.subject.id,
                    "name": file.subject.name,
                    "color": file.subject.name,
                }
                if file.subject
                else {},
                "tags": [tag.name for tag in file.tags],
            }
            for file in files
        ]
        return jsonify({"files": file_list}), 200
    else:
        return jsonify({"error": "User not authenticated"}), 401


@login_required
@app.route("/files/<file_id>")
def serve_file(file_id):
    file = db.session.get(File, file_id)

    if file:
        directory = os.path.join(app.config["UPLOADED_FILES_DEST"], f'user_{session["user_id"]}')
        return send_from_directory(directory, file.filename)
    else:
        return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
