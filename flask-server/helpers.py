from functools import wraps
from flask import redirect, session

def login_required(f):
    """
    Decorates routes to require login.

    https://flask.palletsprojects.com/en/3.0.x/patterns/viewdecorators/#view-decorators
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function