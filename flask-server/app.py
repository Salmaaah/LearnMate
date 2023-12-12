from flask import Flask, redirect, render_template, session, request, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from validator_collection import is_email
from models import db, User
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from helpers import login_required


# Configure application
app = Flask(__name__)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure Flask-SQLAlchemy to use SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///learnmate.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # Disable modification tracking
db.init_app(app)

# Create the tables
with app.app_context():
    db.create_all()

@app.route("/")
def index():
    """Show landing page"""

    return "Index"


@app.route("/login", methods=["POST"])
def login():
    """User login"""
    
    # Forget any user_id
    session.clear()

    data = request.json

    identifier = data.get("identifier").strip().lower()
    password = data.get("password")

    # Server-side validation
    errors = {}

    is_username = "@" not in identifier
    is_email = "@" in identifier

    filter_criteria = or_(User.username == identifier if is_username else False, User.email == identifier if is_email else False)
    user = User.query.filter(filter_criteria).first()

    if not identifier:
        errors["identifier"] = "Invalid username. Please try again." if is_username else "Invalid email address. Please try again."

    elif user is None:
        errors["identifier"] = f"There is no LearnMate account associated with {identifier}. Please try again."

    elif len(password) < 8 or not check_password_hash(user.password, password):
        errors["password"] = "Incorrect password. Please try again."

    if errors:
        return jsonify({"message": "Validation failed", "errors": errors}), 400

    # Login successful
    session["user_id"] = user.id

    return jsonify({"message": "Login successful"}), 200


@app.route("/signup", methods=["POST"])
def signup():
    """Create new user account"""
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
        new_user = User(username=username, email=email, password=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()

        # Remember which user has logged in
        session["user_id"] =  User.query.filter_by(username=username).first().id

        return jsonify({"message": "User created successfully"}), 201
    
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


@app.route("/dashboard")
@login_required
def dashboard():
    """Show user dashboard"""

    return "Dashboard"


@app.route("/logout")
def logout():
    """Log user out"""

    return "log out"
    # # Forget any user_id
    # session.clear()

    # # Redirect user to login form
    # return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)