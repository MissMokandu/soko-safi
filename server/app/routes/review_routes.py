"""
Review routes for Soko Safi
Handles CRUD operations for reviews
"""

from flask_restful import Resource, Api
from flask import Blueprint, request
from app.models import db, Review
from app.models.user import User
from app.auth import require_auth, require_role, require_ownership_or_role

review_bp = Blueprint('review_bp', __name__)
review_api = Api(review_bp)

class ReviewListResource(Resource):
    def get(self):
        """Get all reviews - Public access"""
        reviews = db.session.query(Review, User).join(User, Review.user_id == User.id).all()
        return [{
            'id': r.Review.id,
            'product_id': r.Review.product_id,
            'user_id': r.Review.user_id,
            'rating': r.Review.rating,
            'comment': r.Review.body,
            'user': r.User.full_name,
            'user_profile_picture_url': r.User.profile_picture_url,
            'created_at': r.Review.created_at.isoformat() if r.Review.created_at else None,
            'updated_at': r.Review.updated_at.isoformat() if r.Review.updated_at else None
        } for r in reviews]
    
    @require_auth
    def post(self):
        """Create new review - Authenticated users only"""
        from flask import session
        data = request.json
        
        # Set user_id to current user if not admin
        if session.get('user_role') != 'admin':
            data['user_id'] = session.get('user_id')
        
        new_review = {
            'product_id': data.get('product_id'),
            'user_id': data.get('user_id'),
            'rating': data.get('rating'),
            'body': data.get('comment')
        }
        
        review = Review(**new_review)
        db.session.add(review)
        db.session.commit()
        
        return {
            'message': 'Review created successfully',
            'review': {
                'id': review.id,
                'product_id': review.product_id,
                'user_id': review.user_id,
                'rating': review.rating,
                'comment': review.body
            }
        }, 201

class ReviewResource(Resource):
    def get(self, review_id):
        """Get review details - Public access"""
        result = db.session.query(Review, User).join(User, Review.user_id == User.id).filter(Review.id == review_id).first()
        if not result:
            return {'error': 'Review not found'}, 404
        
        review, user = result
        return {
            'id': review.id,
            'product_id': review.product_id,
            'user_id': review.user_id,
            'rating': review.rating,
            'comment': review.body,
            'user': user.full_name,
            'user_profile_picture_url': user.profile_picture_url,
            'created_at': review.created_at.isoformat() if review.created_at else None,
            'updated_at': review.updated_at.isoformat() if review.updated_at else None
        }
    
    @require_ownership_or_role('user_id', 'admin')
    def put(self, review_id):
        """Update review - Owner or Admin only"""
        review = Review.query.get_or_404(review_id)
        data = request.json
        
        if 'rating' in data:
            review.rating = data['rating']
        if 'comment' in data:
            review.body = data['comment']
        if 'user_id' in data and session.get('user_role') == 'admin':
            review.user_id = data['user_id']
        if 'product_id' in data and session.get('user_role') == 'admin':
            review.product_id = data['product_id']
        
        db.session.commit()
        
        return {
            'message': 'Review updated successfully',
            'review': {
                'id': review.id,
                'product_id': review.product_id,
                'user_id': review.user_id,
                'rating': review.rating,
                'comment': review.body
            }
        }, 200
    
    @require_ownership_or_role('user_id', 'admin')
    def delete(self, review_id):
        """Delete review - Owner or Admin only"""
        review = Review.query.get_or_404(review_id)
        db.session.delete(review)
        db.session.commit()
        
        return {'message': 'Review deleted successfully'}, 200

# Register routes
review_api.add_resource(ReviewListResource, '/')
review_api.add_resource(ReviewResource, '/<review_id>')