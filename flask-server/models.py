from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

# Initialize the SQLAlchemy database instance
db = SQLAlchemy() 

class User(db.Model):
    """User model representing a registered user in the system."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(345), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class Tag(db.Model):
    """Tag model representing tags that can be associated with files, subjects, projects, and notes."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    color = db.Column(db.String(50), default='#eae9ec')
    
    # Foreign key to associate the tag with a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('tags', lazy=True))

class File(db.Model):
    """File model representing files uploaded by users."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    path = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    modified_at = db.Column(db.DateTime, onupdate=lambda: datetime.now(timezone.utc))
    type = db.Column(db.String(100), nullable=False)

    # Foreign key to associate the file with a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('files', lazy=True))

    # Relationships to optional Subject and Project models
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'))
    subject = db.relationship('Subject', backref=db.backref('files', lazy=True))

    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    project = db.relationship('Project', backref=db.backref('files', lazy=True))

    # Many-to-many relationship with Tag model
    tags = db.relationship('Tag', secondary='file_tag', backref=db.backref('files', lazy=True))

class FileTag(db.Model):
    """Association model for many-to-many relationship between Files and Tags."""
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)

class Subject(db.Model):
    """Subject model representing subjects associated with a user."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    color = db.Column(db.String(50), default='#eae9ec')
    status = db.Column(db.String(50))
    level = db.Column(db.String(50))
    progress = db.Column(db.Integer, db.CheckConstraint('progress >= 0 AND progress <= 100'), default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    modified_at = db.Column(db.DateTime, onupdate=lambda: datetime.now(timezone.utc))

    # Foreign key to associate the subject with a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('subjects', lazy=True))

    # Many-to-many relationship with Tag model
    tags = db.relationship('Tag', secondary='subject_tag', backref=db.backref('subjects', lazy=True))

class SubjectTag(db.Model):
    """Association model for many-to-many relationship between Subjects and Tags."""
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)

class Project(db.Model):
    """Project model representing projects associated with a user."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    color = db.Column(db.String(50), default='#eae9ec')
    created_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    modified_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    progress = db.Column(db.Integer, db.CheckConstraint('progress >= 0 AND progress <= 100'), default=0)
    
    # Foreign key to associate the project with a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('projects', lazy=True))

    # Many-to-many relationship with Tag model
    tags = db.relationship('Tag', secondary='project_tag', backref=db.backref('projects', lazy=True))

class ProjectTag(db.Model):
    """Association model for many-to-many relationship between Projects and Tags."""
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)

class Note(db.Model):
    """Note model representing notes associated with users, files, subjects, and projects."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    content = db.Column(db.Text)
    created_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    modified_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Foreign key to associate the note with a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('notes', lazy=True))

    # Foreign keys to associate the note with optional File, Subject, and Project
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'))
    file = db.relationship('File', backref=db.backref('notes', lazy=True))

    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'))
    subject = db.relationship('Subject', backref=db.backref('notes', lazy=True))

    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    project = db.relationship('Project', backref=db.backref('notes', lazy=True))
 
    # Many-to-many relationship with Tag model
    tags = db.relationship('Tag', secondary='note_tag', backref=db.backref('notes', lazy=True))

class NoteTag(db.Model):
    """Association model for many-to-many relationship between Notes and Tags."""
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('note.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)

class Flashcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    term = db.Column(db.String(255), nullable=False)
    definition = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(255))
    
    # Foreign key to associate the flashcard with a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('flashcards', lazy=True))

    # Foreign key to associate the flashcard with a file
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'))
    file = db.relationship('File', backref=db.backref('flashcards', lazy=True))

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    done = db.Column(db.Boolean, default=False, nullable=False)
    order = db.Column(db.Integer, nullable=False)
    
    # Foreign key to associate the todo with a user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('todos', lazy=True))

    # Foreign key to associate the todo with a file
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'))
    file = db.relationship('File', backref=db.backref('todos', lazy=True))