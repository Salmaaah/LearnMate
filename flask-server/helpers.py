from functools import wraps
from flask import session, jsonify
from models import User, Note, FlashcardDeck
import re


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


def generate_untitled_name(item_type):
    """
    Generate a unique untitled name for a given item type (e.g., note, flashcard).
    
    Args:
        item_type (str): The type of item for which to generate a name.
    
    Returns:
        str: A unique untitled name for the item.
    """
    item_models = {
        'note': Note,
        'deck': FlashcardDeck,
    }
    
    itemModel = item_models.get(item_type)
    untitled_items = itemModel.query.filter(itemModel.name.like(f"%Untitled {item_type}%")).all()

    # Check if there are no untitled items or if none match the name "Untitled {item_type}"
    if not untitled_items or all([item.name != f"Untitled {item_type}" for item in untitled_items]):
            item_num = ""
    else:
        # Filter and extract untitled items that strictly follow the format "Untitled {item_type} [number]"
        untitled_items = [item.name for item in untitled_items if re.fullmatch(rf'Untitled {item_type} \d+', item.name)]
        # extract and sort the numbers used in the untitled items
        nums = sorted([int(item.split(' ')[-1]) for item in untitled_items])

        # Find the next available number
        expected_num = 2
        for num in nums:
            if num != expected_num:
                item_num = " " + str(expected_num)
                break
            expected_num += 1
        item_num = " " + str(expected_num)

    return f"Untitled {item_type}{item_num}"