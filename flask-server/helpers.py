from functools import wraps
from flask import session, jsonify
from models import User


def login_required(f):
    """
    Decorates routes to require login.

    https://flask.palletsprojects.com/en/3.0.x/patterns/viewdecorators/#view-decorators
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return jsonify({"error": "Authentication required."}), 401
        if not User.query.filter_by(id=session["user_id"]).first(): # defensive programming against edge cases such as user being deleted from db without logging out
            return jsonify({"error": "User does not exist."}), 400
        return f(*args, **kwargs)
    return decorated_function


def logout_required(f):
    """
    Decorates routes to require logout.

    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is not None:
            return jsonify({"error": "User already logged in."}), 403
        return f(*args, **kwargs)
    return decorated_function