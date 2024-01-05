from models import db, FileType

file_types = [
    {
        "name": "Document",
        "extensions": [".doc", ".docx", ".pdf"],
        "icon_url": "/document-icon.svg",
    },
    {
        "name": "Video",
        "extensions": [".mp4", ".m4p", ".m4v", "mov", ".avi", ".mkv"],
        "icon_url": "/video-icon.svg",
    },
    {
        "name": "Image",
        "extensions": [".jpg", ".png", ".gif"],
        "icon_url": "/image-icon.svg",
    },
    {
        "name": "Presentation",
        "extensions": [".ppt", ".pptx"],
        "icon_url": "/presentation-icon.svg",
    },
    # Add more file types as needed
]

# Insert each file type into the database
for file_type_data in file_types:
    new_file_type = FileType(**file_type_data)
    db.session.add(new_file_type)

# Commit the changes to the database
db.session.commit()
