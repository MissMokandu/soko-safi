"""
Authentication routes for Soko Safi
Handles user registration, login, logout, and profile management
"""

from flask import Blueprint, request, jsonify, session, make_response
from flask_restful import Resource, Api
from app.models import db, User, UserRole
from app.auth import hash_password, verify_password, login_user, logout_user, get_current_user, require_auth, require_ownership_or_role
import re

auth_bp = Blueprint('auth_bp', __name__)
auth_api = Api(auth_bp)

# --- CORS Configuration Helpers ---
# The client origin (where the request is coming from)
ALLOWED_ORIGIN = 'http://localhost:5174' 

def _add_cors_headers(response):
    """Helper function to add common CORS headers to the final response."""
    # Must specify origin when using credentials
    response.headers.add('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

def _handle_options_preflight(methods):
    """Generates a proper OPTIONS response for a preflight request."""
    response = make_response('', 200)
    response.headers.add('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
    response.headers.add('Access-Control-Allow-Methods', methods)
    # Allow common headers used in POST/PUT requests
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization') 
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '86400') # Cache preflight response for 24 hours
    return response
# ----------------------------------

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

class RegisterResource(Resource):
    """Handle user registration"""
    
    def options(self):
        """Handle CORS preflight request for POST"""
        return _handle_options_preflight('POST, OPTIONS')
    
    def post(self):
        try:
            print(f"[REGISTER] Request received from {request.remote_addr}")
            data = request.get_json()
            print(f"[REGISTER] Request data: {data}")
            
            # Validate required fields
            required_fields = ['email', 'password', 'full_name', 'role']
            for field in required_fields:
                if not data.get(field):
                    print(f"[REGISTER] Missing field: {field}")
                    response = make_response({
                        'error': 'Missing required field',
                        'message': f'{field} is required'
                    }, 400)
                    return _add_cors_headers(response) # Apply CORS
            
            email = data['email'].strip().lower()
            password = data['password']
            full_name = data['full_name'].strip()
            role = data['role'].strip().lower()
            
            # Validate email format
            print(f"[REGISTER] Validating email: {email}")
            if not validate_email(email):
                print(f"[REGISTER] Invalid email format: {email}")
                response = make_response({
                    'error': 'Invalid email format',
                    'message': 'Please provide a valid email address'
                }, 400)
                return _add_cors_headers(response) # Apply CORS
            
            # Validate password strength
            print(f"[REGISTER] Validating password strength")
            is_valid_password, password_message = validate_password(password)
            if not is_valid_password:
                print(f"[REGISTER] Weak password: {password_message}")
                response = make_response({
                    'error': 'Weak password',
                    'message': password_message
                }, 400)
                return _add_cors_headers(response) # Apply CORS
            
            # Validate role
            print(f"[REGISTER] Validating role: {role}")
            if role not in ['buyer', 'artisan']:
                print(f"[REGISTER] Invalid role: {role}")
                response = make_response({
                    'error': 'Invalid role',
                    'message': 'Role must be either "buyer" or "artisan"'
                }, 400)
                return _add_cors_headers(response) # Apply CORS
            
            # Check if user already exists
            print(f"[REGISTER] Checking if user exists: {email}")
            existing_user = User.query.filter_by(email=email, deleted_at=None).first()
            if existing_user:
                print(f"[REGISTER] User already exists: {email}")
                response = make_response({
                    'error': 'User already exists',
                    'message': 'An account with this email already exists'
                }, 409)
                return _add_cors_headers(response) # Apply CORS
            
            # Create new user
            print(f"[REGISTER] Creating new user: {email}")
            user = User(
                email=email,
                password_hash=hash_password(password),
                full_name=full_name,
                role=UserRole(role),
                phone=data.get('phone', '').strip(),
                location=data.get('location', '').strip(),
                is_verified=False
            )
            
            print(f"[REGISTER] Saving user to database")
            db.session.add(user)
            db.session.commit()
            print(f"[REGISTER] User saved with ID: {user.id}")
            
            # Log in the user automatically after registration
            print(f"[REGISTER] Logging in user: {user.id}")
            login_user(user.id, user.role.value)
            
            print(f"[REGISTER] Registration successful for: {email}")
            response = make_response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role.value,
                    'is_verified': user.is_verified
                }
            }, 201)
            # Use the helper to add all required CORS headers
            return _add_cors_headers(response) 
            
        except Exception as e:
            print(f"[REGISTER] Registration failed with error: {str(e)}")
            print(f"[REGISTER] Error type: {type(e).__name__}")
            db.session.rollback()
            response = make_response({
                'error': 'Registration failed',
                'message': f'An error occurred during registration: {str(e)}'
            }, 500)
            return _add_cors_headers(response) # Apply CORS

class LoginResource(Resource):
    """Handle user login"""
    
    def options(self):
        """Handle CORS preflight request for POST"""
        return _handle_options_preflight('POST, OPTIONS')
    
    def post(self):
        try:
            print(f"[LOGIN] Request received from {request.remote_addr}")
            data = request.get_json()
            print(f"[LOGIN] Request data received (email only): {data.get('email') if data else 'No data'}")
            
            # Validate required fields
            if not data or not data.get('email') or not data.get('password'):
                print(f"[LOGIN] Missing credentials")
                response = make_response({
                    'error': 'Missing credentials',
                    'message': 'Email and password are required'
                }, 400)
                return _add_cors_headers(response) # Apply CORS
            
            email = data['email'].strip().lower()
            password = data['password']
            print(f"[LOGIN] Attempting login for: {email}")
            
            # Find user by email
            print(f"[LOGIN] Looking up user in database")
            user = User.query.filter_by(email=email, deleted_at=None).first()
            
            if not user:
                print(f"[LOGIN] User not found: {email}")
                response = make_response({
                    'error': 'Invalid credentials',
                    'message': 'Email or password is incorrect'
                }, 401)
                return _add_cors_headers(response) # Apply CORS
            
            print(f"[LOGIN] User found, verifying password")
            if not verify_password(password, user.password_hash):
                print(f"[LOGIN] Invalid password for: {email}")
                response = make_response({
                    'error': 'Invalid credentials',
                    'message': 'Email or password is incorrect'
                }, 401)
                return _add_cors_headers(response) # Apply CORS
            
            # Log in the user
            print(f"[LOGIN] Password verified, logging in user: {user.id}")
            login_user(user.id, user.role.value)
            
            print(f"[LOGIN] Login successful for: {email}")
            response = make_response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role.value,
                    'is_verified': user.is_verified
                }
            }, 200)
            # Use the helper to add all required CORS headers
            return _add_cors_headers(response)
            
        except Exception as e:
            print(f"[LOGIN] Login failed with error: {str(e)}")
            print(f"[LOGIN] Error type: {type(e).__name__}")
            response = make_response({
                'error': 'Login failed',
                'message': f'An error occurred during login: {str(e)}'
            }, 500)
            return _add_cors_headers(response) # Apply CORS

class LogoutResource(Resource):
    """Handle user logout"""
    
    def options(self):
        """Handle CORS preflight request for POST"""
        return _handle_options_preflight('POST, OPTIONS')
    
    @require_auth
    def post(self):
        try:
            logout_user()
            response = make_response({
                'message': 'Logout successful'
            }, 200)
            return _add_cors_headers(response) # Apply CORS
        except Exception as e:
            response = make_response({
                'error': 'Logout failed',
                'message': 'An error occurred during logout'
            }, 500)
            return _add_cors_headers(response) # Apply CORS

class ProfileResource(Resource):
    """Handle user profile operations"""
    
    def options(self):
        """Handle CORS preflight request for GET/PUT"""
        return _handle_options_preflight('GET, PUT, OPTIONS')
    
    @require_auth
    def get(self):
        """Get current user profile"""
        try:
            current_user = get_current_user()
            user = User.query.get(current_user['user_id'])
            
            if not user:
                response = make_response({
                    'error': 'User not found',
                    'message': 'User profile not found'
                }, 404)
                return _add_cors_headers(response) # Apply CORS
            
            response = make_response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role.value,
                    'phone': user.phone,
                    'location': user.location,
                    'description': user.description,
                    'is_verified': user.is_verified,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                }
            }, 200)
            return _add_cors_headers(response) # Apply CORS
            
        except Exception as e:
            response = make_response({
                'error': 'Profile retrieval failed',
                'message': 'An error occurred while retrieving profile'
            }, 500)
            return _add_cors_headers(response) # Apply CORS
    
    @require_auth
    def put(self):
        """Update current user profile"""
        try:
            current_user = get_current_user()
            user = User.query.get(current_user['user_id'])
            
            if not user:
                response = make_response({
                    'error': 'User not found',
                    'message': 'User profile not found'
                }, 404)
                return _add_cors_headers(response) # Apply CORS
            
            data = request.get_json()
            
            # Update allowed fields
            if 'full_name' in data: user.full_name = data['full_name'].strip()
            if 'phone' in data: user.phone = data['phone'].strip()
            if 'location' in data: user.location = data['location'].strip()
            if 'description' in data: user.description = data['description'].strip()
            
            db.session.commit()
            
            response = make_response({
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role.value,
                    'phone': user.phone,
                    'location': user.location,
                    'description': user.description,
                    'is_verified': user.is_verified
                }
            }, 200)
            return _add_cors_headers(response) # Apply CORS
            
        except Exception as e:
            db.session.rollback()
            response = make_response({
                'error': 'Profile update failed',
                'message': 'An error occurred while updating profile'
            }, 500)
            return _add_cors_headers(response) # Apply CORS

class ChangePasswordResource(Resource):
    """Handle password changes"""
    
    def options(self):
        """Handle CORS preflight request for POST"""
        return _handle_options_preflight('POST, OPTIONS')
        
    @require_auth
    def post(self):
        try:
            current_user = get_current_user()
            user = User.query.get(current_user['user_id'])
            
            if not user:
                response = make_response({
                    'error': 'User not found',
                    'message': 'User profile not found'
                }, 404)
                return _add_cors_headers(response) # Apply CORS
            
            data = request.get_json()
            
            if not data.get('current_password') or not data.get('new_password'):
                response = make_response({
                    'error': 'Missing passwords',
                    'message': 'Current password and new password are required'
                }, 400)
                return _add_cors_headers(response) # Apply CORS
            
            current_password = data['current_password']
            new_password = data['new_password']
            
            # Verify current password
            if not verify_password(current_password, user.password_hash):
                response = make_response({
                    'error': 'Invalid current password',
                    'message': 'Current password is incorrect'
                }, 401)
                return _add_cors_headers(response) # Apply CORS
            
            # Validate new password
            is_valid_password, password_message = validate_password(new_password)
            if not is_valid_password:
                response = make_response({
                    'error': 'Weak password',
                    'message': password_message
                }, 400)
                return _add_cors_headers(response) # Apply CORS
            
            # Update password
            user.password_hash = hash_password(new_password)
            db.session.commit()
            
            response = make_response({
                'message': 'Password changed successfully'
            }, 200)
            return _add_cors_headers(response) # Apply CORS
            
        except Exception as e:
            db.session.rollback()
            response = make_response({
                'error': 'Password change failed',
                'message': 'An error occurred while changing password'
            }, 500)
            return _add_cors_headers(response) # Apply CORS

class SessionResource(Resource):
    """Handle session information"""
    
    def options(self):
        """Handle CORS preflight request for GET"""
        return _handle_options_preflight('GET, OPTIONS')

    def get(self):
        """Get current session info"""
        current_user = get_current_user()
        
        if current_user:
            response = make_response({
                'authenticated': True,
                'user': current_user
            }, 200)
        else:
            response = make_response({
                'authenticated': False,
                'user': None
            }, 200)
            
        # Use the helper to ensure Access-Control-Allow-Origin is present
        return _add_cors_headers(response)

class ResetPasswordResource(Resource):
    """Handle password reset requests"""

    def options(self):
        """Handle CORS preflight request for POST"""
        return _handle_options_preflight('POST, OPTIONS')
    
    def post(self):
        """Request password reset"""
        try:
            data = request.get_json()
            
            if not data or not data.get('email'):
                response = make_response({
                    'error': 'Missing email',
                    'message': 'Email is required for password reset'
                }, 400)
                return _add_cors_headers(response) # Apply CORS
            
            email = data['email'].strip().lower()
            
            # Find user by email
            user = User.query.filter_by(email=email, deleted_at=None).first()
            
            # Always return success to prevent email enumeration
            if user:
                # In a real app, you would send an email with reset token
                # For now, just log it or implement basic reset
                pass
            
            response = make_response({
                'message': 'If an account with that email exists, a password reset link has been sent'
            }, 200)
            return _add_cors_headers(response) # Apply CORS
            
        except Exception as e:
            response = make_response({
                'error': 'Password reset failed',
                'message': 'An error occurred during password reset request'
            }, 500)
            return _add_cors_headers(response) # Apply CORS

# Register routes
auth_api.add_resource(RegisterResource, '/register')
auth_api.add_resource(LoginResource, '/login')
auth_api.add_resource(LogoutResource, '/logout')
auth_api.add_resource(ProfileResource, '/profile')
auth_api.add_resource(ChangePasswordResource, '/change-password')
auth_api.add_resource(SessionResource, '/session')
auth_api.add_resource(ResetPasswordResource, '/reset-password')
