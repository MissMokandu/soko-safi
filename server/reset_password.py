#!/usr/bin/env python3
"""
Simple password reset utility for development
"""
from app.models.user import User
from app.models import db
from app import create_app
from werkzeug.security import generate_password_hash

def reset_user_password(email, new_password):
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"❌ User with email {email} not found")
            return False
        
        # Hash the new password
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        
        print(f"✅ Password reset successful for {email}")
        print(f"   Role: {user.role}")
        print(f"   New password: {new_password}")
        return True

if __name__ == "__main__":
    email = "faisalabdi493@gmail.com"
    new_password = "Fei@2020"
    
    print(f"🔄 Resetting password for {email}...")
    reset_user_password(email, new_password)