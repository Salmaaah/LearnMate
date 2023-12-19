from functools import wraps
from flask import session, jsonify

def login_required(f):
    """
    Decorates routes to require login.

    https://flask.palletsprojects.com/en/3.0.x/patterns/viewdecorators/#view-decorators
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return jsonify({"message": "Authentication required."}), 401
        return f(*args, **kwargs)
    return decorated_function


def logout_required(f):
    """
    Decorates routes to require logout.

    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is not None:
            return jsonify({"message": "User already logged in."}), 403
        return f(*args, **kwargs)
    return decorated_function