"""
Favorite routes for Soko Safi
Handles CRUD operations for favorites
"""

from flask_restful import Resource, Api
from flask import Blueprint, request
from app.models import db, Favorite
from app.auth import require_auth, require_role


favorite_bp = Blueprint('favorite_bp', __name__)
favorite_api = Api(favorite_bp)

class FavoriteListResource(Resource):
    @require_auth
    def get(self):
        """Get favorites - Admin gets all, users get their own favorites"""
        from flask import session
        from app.models.product import Product

        # Get user_id from session or JWT
        current_user_id = session.get('user_id')
        if not current_user_id:
            try:
                from flask_jwt_extended import get_jwt_identity
                current_user_id = get_jwt_identity()
            except Exception:
                return {'error': 'Authentication required'}, 401
        
        if not current_user_id:
            return {'error': 'Authentication required'}, 401
            
        user_role = session.get('user_role', 'buyer')

        if user_role == 'admin':
            # Admin gets all favorites
            favorites = Favorite.query.all()
        else:
            # Regular users get their own favorites
            favorites = Favorite.query.filter_by(user_id=current_user_id).all()

        # Enhance favorites with product details
        enhanced_favorites = []
        for favorite in favorites:
            product = Product.query.get(favorite.product_id) if favorite.product_id else None

            enhanced_favorite = {
                'id': favorite.id,
                'user_id': favorite.user_id,
                'product_id': favorite.product_id,
                'product': {
                    'id': product.id if product else None,
                    'title': product.title if product else 'Unknown Product',
                    'price': float(product.price) if product and product.price else 0,
                    'image': product.image if product else None,
                    'artisan_name': product.artisan_name if product else None
                } if product else None,
                'created_at': favorite.created_at.isoformat() if favorite.created_at else None
            }
            enhanced_favorites.append(enhanced_favorite)

        return enhanced_favorites
    
    @require_auth
    def post(self):
        """Create new favorite - Authenticated users only"""
        from flask import session
        data = request.json
        
        if not data or 'product_id' not in data:
            return {'error': 'product_id is required'}, 400
        
        try:
            # Get user_id from session or JWT
            user_id = session.get('user_id')
            if not user_id:
                try:
                    from flask_jwt_extended import get_jwt_identity
                    user_id = get_jwt_identity()
                except Exception:
                    return {'error': 'Authentication required'}, 401
            
            if not user_id:
                return {'error': 'Authentication required'}, 401
            
            # Set user_id to current user if not admin
            if session.get('user_role') == 'admin' and 'user_id' in data:
                user_id = data['user_id']
            
            # Check if favorite already exists
            existing = Favorite.query.filter_by(
                user_id=user_id, 
                product_id=data['product_id']
            ).first()
            
            if existing:
                return {'error': 'Product already in favorites'}, 409
            
            favorite = Favorite(
                user_id=user_id,
                product_id=data['product_id']
            )
            db.session.add(favorite)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create favorite'}, 500
        
        return {
            'message': 'Favorite created successfully',
            'favorite': {
                'id': favorite.id,
                'user_id': favorite.user_id,
                'product_id': favorite.product_id
            }
        }, 201

class FavoriteResource(Resource):
    @require_auth
    def get(self, favorite_id):
        """Get favorite details - Owner or Admin only"""
        favorite = Favorite.query.get_or_404(favorite_id)
        return {
            'id': favorite.id,
            'user_id': favorite.user_id,
            'product_id': favorite.product_id,
            'created_at': favorite.created_at.isoformat() if favorite.created_at else None
        }
    
    @require_auth
    def put(self, favorite_id):
        """Update favorite - Owner or Admin only"""
        favorite = Favorite.query.get_or_404(favorite_id)
        data = request.json
        
        if not data:
            return {'error': 'No data provided'}, 400
        
        try:
            from flask import session
            if 'product_id' in data:
                favorite.product_id = data['product_id']
            if 'user_id' in data and session.get('user_role') == 'admin':
                favorite.user_id = data['user_id']
            
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to update favorite'}, 500
        
        return {
            'message': 'Favorite updated successfully',
            'favorite': {
                'id': favorite.id,
                'user_id': favorite.user_id,
                'product_id': favorite.product_id
            }
        }, 200
    
    @require_auth
    def delete(self, favorite_id):
        """Delete favorite - Owner or Admin only"""
        from flask import session
        
        # Get user_id from session or JWT
        user_id = session.get('user_id')
        if not user_id:
            try:
                from flask_jwt_extended import get_jwt_identity
                user_id = get_jwt_identity()
            except Exception:
                return {'error': 'Authentication required'}, 401
        
        if not user_id:
            return {'error': 'Authentication required'}, 401
            
        favorite = Favorite.query.get_or_404(favorite_id)
        
        # Check ownership
        if favorite.user_id != user_id and session.get('user_role') != 'admin':
            return {'error': 'Access denied'}, 403
        
        try:
            db.session.delete(favorite)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to delete favorite'}, 500
        
        return {'message': 'Favorite deleted successfully'}, 200

class FavoriteByProductResource(Resource):
    @require_auth
    def delete(self, product_id):
        """Delete favorite by product ID - Owner only"""
        from flask import session
        
        # Get user_id from session or JWT
        user_id = session.get('user_id')
        if not user_id:
            try:
                from flask_jwt_extended import get_jwt_identity
                user_id = get_jwt_identity()
            except Exception:
                return {'error': 'Authentication required'}, 401
        
        if not user_id:
            return {'error': 'Authentication required'}, 401
            
        favorite = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
        if not favorite:
            return {'error': 'Favorite not found'}, 404
        
        try:
            db.session.delete(favorite)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to delete favorite'}, 500
        
        return {'message': 'Favorite deleted successfully'}, 200

# Register routes
favorite_api.add_resource(FavoriteListResource, '/')
favorite_api.add_resource(FavoriteResource, '/<favorite_id>')
favorite_api.add_resource(FavoriteByProductResource, '/<product_id>')
