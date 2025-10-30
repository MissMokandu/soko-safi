from app import create_app
from app.extensions import db, socketio
from app.utils.db_migrations import ensure_deleted_at_columns
import os
import logging

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

try:
    app = create_app()
except Exception as e:
    logging.error(f"Failed to create app: {e}", exc_info=True)
    exit(1)

if __name__ == '__main__':
    try:
        with app.app_context():
            # db.create_all()
            # Ensure optional columns exist for older databases (adds `deleted_at` for sqlite)
            ensure_deleted_at_columns(app)
        
        # Get configuration from environment
        debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        host = os.getenv('FLASK_HOST', '0.0.0.0')
        port = int(os.getenv('FLASK_PORT', 5001))
        
        logging.info(f"Starting Soko Safi server on {host}:{port} (debug={debug_mode})")

        socketio.run(app, host=host, port=port, debug=debug_mode)

    except Exception as e:
        logging.error(f"Failed to start server: {e}", exc_info=True)
        exit(1)