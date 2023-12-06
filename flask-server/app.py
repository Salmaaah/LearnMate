from flask import Flask, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from validator_collection import checkers
from models import db, User
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


@app.route("/")
def index():
    """Show landing page"""

    return "Index"


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""
    
    # Forget any user_id
    session.clear()

    # User reached route via POST
    if request.method == "POST":
    
        identifier = request.form.get("identifier")
        
        # Initialize error messages
        error = None
        identifier_error = None
        password_error = None

        # Ensure identifier was submitted
        if not identifier:
            identifier_error = "Invalid username/email address"
        
        # Ensure password was submitted
        elif not request.form.get("password"):
            password_error = "Invalid password"
        
        else:
            # Query database for identifier
            if "@" in identifier:
                rows = db.execute(
                    "SELECT * FROM users WHERE email = ?", identifier
                )
            else:
                rows = db.execute(
                    "SELECT * FROM users WHERE username = ?", identifier
                )

            # Ensure identifier exists
            if len(rows) != 1:
                error = f"There is no account associated with {identifier}. Please try again."
            
            # Ensure password is correct
            elif not check_password_hash(rows[0]["hash"], request.form.get("password")):
                error = "Wrong password. Please try again."
            
            else:
                # Remember which user has logged in
                session["user_id"] = rows[0]["id"]

                # Redirect user to home page
                return redirect("/dashboard")

    # User reached route via GET
    return render_template("login.html", error=error, identifier_error=identifier_error, password_error=password_error)


@app.route("/register", methods=["GET", "POST"])
def register():
    """Create new user account"""

    # User reached route via POST
    if request.method == "POST":
        username = request.form.get("username").strip()
        email = request.form.get("email").strip()
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        usernames = db.execute("SELECT username FROM users;")
        usernames = [u["username"] for u in usernames]
        
        emails = db.execute("SELECT email FROM users;")
        emails = [e["email"] for e in emails]

        # if one of the fields has not been filled (handled by js but backup handling incase of adversary)
        if not all([username, email, password, confirmation]):
            error = "Please fill out the missing fields"
        
        # if username already exists
        elif username in usernames:
            username_error = "Username already exists."

        # if username doesn't follow the conditions

        # if email already exists
        elif email in emails:
            email_error = "Email already exists."

        # if email is invalid

        # if password doesn't follow the conditions
        # if passwords don't match

        elif password != confirmation:
            return apology("Passwords do not match", 400)

        db.execute(
            "INSERT INTO users (username, email, hash) VALUES (?, ?, ?)",
            username,
            email,
            generate_password_hash(password),
        )

        # Remember which user has logged in
        session["user_id"] = db.execute("SELECT * FROM users WHERE email = ?", email)[0]["id"]

        # Redirect user to home page
        return redirect("/dashboard")


    if request.method == "GET":
        return render_template("register.html")

@app.route("/dashboard")
@login_required
def dashboard():
    """Show user dashboard"""

    return "Dashboard"


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


if __name__ == '__main__':
    app.run(debug=True)