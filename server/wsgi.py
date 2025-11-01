from app import create_app
from app.extensions import db
from app.utils.db_migrations import ensure_deleted_at_columns

app = create_app()

with app.app_context():
    db.create_all()
    ensure_deleted_at_columns(app)

if __name__ == "__main__":
    app.run()