from flask import Flask, redirect, render_template, session, request, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from validator_collection import is_email
from models import db, User
from sqlalchemy.exc import IntegrityError
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


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    return "log in"
    
    # # Forget any user_id
    # session.clear()

    # # User reached route via POST
    # if request.method == "POST":
    
    #     identifier = request.form.get("identifier")
        
    #     # Initialize error messages
    #     error = None
    #     identifier_error = None
    #     password_error = None

    #     # Ensure identifier was submitted
    #     if not identifier:
    #         identifier_error = "Invalid username/email address"
        
    #     # Ensure password was submitted
    #     elif not request.form.get("password"):
    #         password_error = "Invalid password"
        
    #     else:
    #         # Query database for identifier
    #         if "@" in identifier:
    #             rows = db.execute(
    #                 "SELECT * FROM users WHERE email = ?", identifier
    #             )
    #         else:
    #             rows = db.execute(
    #                 "SELECT * FROM users WHERE username = ?", identifier
    #             )

    #         # Ensure identifier exists
    #         if len(rows) != 1:
    #             error = f"There is no account associated with {identifier}. Please try again."
            
    #         # Ensure password is correct
    #         elif not check_password_hash(rows[0]["hash"], request.form.get("password")):
    #             error = "Wrong password. Please try again."
            
    #         else:
    #             # Remember which user has logged in
    #             session["user_id"] = rows[0]["id"]

    #             # Redirect user to home page
    #             return redirect("/dashboard")

    # # User reached route via GET
    # return render_template("login.html", error=error, identifier_error=identifier_error, password_error=password_error)


@app.route("/signup", methods=["POST"])
def signup():
    """Create new user account"""
    data = request.json

    username = data.get('username').strip().lower()
    email = data.get('email').strip().lower()
    password = data.get('password')
    confirmPassword = data.get('confirmPassword')

    # Server-side validation
    errors = {}

    if not username or len(username) < 5:
        errors['username'] = 'Username is required.'

    if not email or not is_email(email):
        errors['email'] = 'Invalid email format.'

    if not password or len(password) < 8:
        errors['password'] = 'Password must be at least 8 characters long.'

    if not confirmPassword or password != confirmPassword:
        errors['confirmPassword'] = 'Passwords do not match.'

    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    try:
        # Add new user to database
        new_user = User(username=username, email=email, password=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()

        # Remember which user has logged in
        session["user_id"] =  User.query.filter_by(username=username).first().id

        return jsonify({'message': 'User created successfully'}), 201
    
    except IntegrityError as e:
        db.session.rollback()
        if 'UNIQUE constraint failed: users.username' in str(e.orig):
            errors['username'] = 'Username already exists.'
            return jsonify({'message': str(e), 'errors': errors}), 400
        
        elif 'UNIQUE constraint failed: users.email' in str(e.orig):
            errors['email'] = 'Email already exists.'
            return jsonify({'message': str(e), 'errors': errors}), 400
        
        else:
            return jsonify({'message': str(e)}), 400    


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


if __name__ == '__main__':
    app.run(debug=True)