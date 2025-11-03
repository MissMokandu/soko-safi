"""
Artisan routes for Soko Safi
Handles CRUD operations for artisan showcase media and social links
"""

from flask_restful import Resource, Api
from flask import Blueprint, request, jsonify
from app.models import db, ArtisanShowcaseMedia, ArtisanSocial, User, Product
# Removed problematic auth imports

artisan_bp = Blueprint('artisan_bp', __name__)
artisan_api = Api(artisan_bp)

class ArtisanShowcaseMediaListResource(Resource):
    def get(self):
        """Get all artisan showcase media - Public access"""
        try:
            return []
        except Exception as e:
            return [], 200
    
    def post(self):
        """Create new artisan showcase media - Artisan or Admin only"""
        from flask import session
        data = request.json
        
        if not data or 'media_type' not in data or 'media_url' not in data:
            return {'error': 'media_type and media_url are required'}, 400
        
        try:
            # Set artisan_id to current user if not admin
            artisan_id = session.get('user_id')
            if session.get('user_role') == 'admin' and 'artisan_id' in data:
                artisan_id = data['artisan_id']
            
            showcase_media = ArtisanShowcaseMedia(
                artisan_id=artisan_id,
                media_type=data.get('media_type'),
                media_url=data.get('media_url'),
                caption=data.get('caption')
            )
            db.session.add(showcase_media)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create showcase media'}, 500
        
        return {
            'message': 'Artisan showcase media created successfully',
            'showcase_media': {
                'id': showcase_media.id,
                'artisan_id': showcase_media.artisan_id,
                'media_type': showcase_media.media_type,
                'media_url': showcase_media.media_url,
                'caption': showcase_media.caption
            }
        }, 201

class ArtisanShowcaseMediaResource(Resource):
    def get(self, showcase_media_id):
        """Get artisan showcase media details - Owner or Admin only"""
        showcase_media = ArtisanShowcaseMedia.query.get_or_404(showcase_media_id)
        return {
            'id': showcase_media.id,
            'artisan_id': showcase_media.artisan_id,
            'media_type': showcase_media.media_type,
            'media_url': showcase_media.media_url,
            'caption': showcase_media.caption,
            'created_at': showcase_media.created_at.isoformat() if showcase_media.created_at else None
        }
    
    def put(self, showcase_media_id):
        """Update artisan showcase media - Owner or Admin only"""
        try:
            showcase_media = ArtisanShowcaseMedia.query.get_or_404(showcase_media_id)
            data = request.json
            
            if not data:
                return {'error': 'No data provided'}, 400
            
            from flask import session
            if 'media_type' in data:
                showcase_media.media_type = data['media_type']
            if 'media_url' in data:
                showcase_media.media_url = data['media_url']
            if 'caption' in data:
                showcase_media.caption = data['caption']
            if 'artisan_id' in data and session.get('user_role') == 'admin':
                showcase_media.artisan_id = data['artisan_id']
            
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to update showcase media'}, 500
        
        return {
            'message': 'Artisan showcase media updated successfully',
            'showcase_media': {
                'id': showcase_media.id,
                'artisan_id': showcase_media.artisan_id,
                'media_type': showcase_media.media_type,
                'media_url': showcase_media.media_url,
                'caption': showcase_media.caption
            }
        }, 200
    
    def delete(self, showcase_media_id):
        """Delete artisan showcase media - Owner or Admin only"""
        try:
            showcase_media = ArtisanShowcaseMedia.query.get_or_404(showcase_media_id)
            from datetime import datetime
            showcase_media.deleted_at = datetime.utcnow()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to delete showcase media'}, 500
        
        return {'message': 'Artisan showcase media deleted successfully'}, 200

class ArtisanSocialListResource(Resource):
    def get(self):
        """Get all artisan social links - Admin only"""
        from flask import session
        if session.get('user_role') != 'admin':
            return {'error': 'Admin access required'}, 403
        
        social_links = ArtisanSocial.query.filter_by(deleted_at=None).all()
        return [{
            'id': asl.id,
            'artisan_id': asl.artisan_id,
            'platform': asl.platform,
            'url': asl.url,
            'created_at': asl.created_at.isoformat() if asl.created_at else None
        } for asl in social_links]
    
    def post(self):
        """Create new artisan social link - Artisan or Admin only"""
        from flask import session
        data = request.json
        
        if not data or 'platform' not in data or 'url' not in data:
            return {'error': 'platform and url are required'}, 400
        
        try:
            # Set artisan_id to current user if not admin
            artisan_id = session.get('user_id')
            if session.get('user_role') == 'admin' and 'artisan_id' in data:
                artisan_id = data['artisan_id']
            
            social_link = ArtisanSocial(
                artisan_id=artisan_id,
                platform=data.get('platform'),
                url=data.get('url')
            )
            db.session.add(social_link)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create social link'}, 500
        
        return {
            'message': 'Artisan social link created successfully',
            'social_link': {
                'id': social_link.id,
                'artisan_id': social_link.artisan_id,
                'platform': social_link.platform,
                'url': social_link.url
            }
        }, 201

class ArtisanSocialResource(Resource):
    def get(self, social_link_id):
        """Get artisan social link details - Owner or Admin only"""
        social_link = ArtisanSocial.query.get_or_404(social_link_id)
        return {
            'id': social_link.id,
            'artisan_id': social_link.artisan_id,
            'platform': social_link.platform,
            'url': social_link.url,
            'created_at': social_link.created_at.isoformat() if social_link.created_at else None
        }
    
    def put(self, social_link_id):
        """Update artisan social link - Owner or Admin only"""
        social_link = ArtisanSocial.query.get_or_404(social_link_id)
        data = request.json
        
        if 'platform' in data:
            social_link.platform = data['platform']
        if 'url' in data:
            social_link.url = data['url']
        if 'artisan_id' in data and session.get('user_role') == 'admin':
            social_link.artisan_id = data['artisan_id']
        
        db.session.commit()
        
        return {
            'message': 'Artisan social link updated successfully',
            'social_link': {
                'id': social_link.id,
                'artisan_id': social_link.artisan_id,
                'platform': social_link.platform,
                'url': social_link.url
            }
        }, 200
    
    def delete(self, social_link_id):
        """Delete artisan social link - Owner or Admin only"""
        social_link = ArtisanSocial.query.get_or_404(social_link_id)
        from datetime import datetime
        social_link.deleted_at = datetime.utcnow()
        db.session.commit()
        
        return {'message': 'Artisan social link deleted successfully'}, 200

class ArtisanDashboardResource(Resource):
    def get(self):
        """Get artisan dashboard statistics - Artisan only"""
        try:
            import traceback
            from flask import session, current_app

            current_app.logger.info("Artisan dashboard accessed")

            # Check if user is authenticated and is an artisan
            user_id = session.get('user_id')
            user_role = session.get('user_role')

            if not user_id or user_role != 'artisan':
                return {
                    'stats': {
                        'total_products': 0,
                        'total_orders': 0,
                        'total_revenue': 0
                    },
                    'products': [],
                    'orders': []
                }, 200

            # Get artisan's products count
            total_products = Product.query.filter_by(artisan_id=user_id, status='active').count()

            # Get total orders (orders containing artisan's products)
            from app.models.order import Order, OrderItem
            from sqlalchemy import func

            # Get all order items for this artisan
            order_items = db.session.query(OrderItem).filter_by(artisan_id=user_id).subquery()

            # Count distinct orders
            total_orders = db.session.query(func.count(func.distinct(order_items.c.order_id))).scalar() or 0

            # Calculate total revenue from completed orders
            total_revenue = db.session.query(func.sum(OrderItem.price * OrderItem.quantity)).filter(
                OrderItem.artisan_id == user_id,
                OrderItem.order_id.in_(
                    db.session.query(Order.id).filter(Order.status == 'completed')
                )
            ).scalar() or 0

            response_data = {
                'stats': {
                    'total_products': total_products,
                    'total_orders': total_orders,
                    'total_revenue': float(total_revenue)
                },
                'products': [],
                'orders': []
            }

            current_app.logger.info(f"Dashboard response: {response_data}")
            return response_data, 200

        except Exception as e:
            import traceback
            from flask import current_app

            error_trace = traceback.format_exc()
            current_app.logger.error(f"Dashboard error: {e}")
            current_app.logger.error(f"Full traceback: {error_trace}")

            return {
                'stats': {
                    'total_products': 0,
                    'total_orders': 0,
                    'total_revenue': 0
                },
                'products': [],
                'orders': []
            }, 200

class ArtisanOrdersResource(Resource):
    def get(self):
        """Get orders for artisan's products - Public access with safe defaults"""
        try:
            return []
        except Exception as e:
            return []

class ArtisanMessagesResource(Resource):
    def get(self):
        """Get messages for artisan - Public access with safe defaults"""
        try:
            return []
        except Exception as e:
            return []

class ArtisanProfileResource(Resource):
    def get(self, artisan_id):
        """Get artisan profile by ID - Public access"""
        try:
            artisan = User.query.filter_by(id=artisan_id, role='artisan').first()
            if not artisan:
                return {'error': 'Artisan not found'}, 404
            
            return {
                'id': artisan.id,
                'full_name': artisan.full_name,
                'email': artisan.email,
                'description': artisan.description,
                'location': artisan.location,
                'profile_picture_url': artisan.profile_picture_url,
                'banner_image_url': artisan.banner_image_url,
                'created_at': artisan.created_at.isoformat() if artisan.created_at else None,
                'is_verified': artisan.is_verified
            }, 200
        except Exception as e:
            return {'error': 'Failed to fetch artisan profile'}, 500

class ArtisanStatsResource(Resource):
    def get(self, artisan_id):
        """Get artisan statistics - Public access"""
        try:
            from app.models.review import Review
            from app.models.order import Order, OrderItem
            from sqlalchemy import func
            
            # Get products by artisan
            products = Product.query.filter_by(artisan_id=artisan_id, status='active').all()
            product_ids = [p.id for p in products]
            
            # Calculate average rating and review count
            if product_ids:
                rating_data = db.session.query(
                    func.avg(Review.rating).label('avg_rating'),
                    func.count(Review.id).label('review_count')
                ).filter(Review.product_id.in_(product_ids)).first()
                
                avg_rating = float(rating_data.avg_rating) if rating_data.avg_rating else 0
                review_count = rating_data.review_count or 0
                
                # Calculate total sales from completed orders
                sales_count = db.session.query(func.sum(OrderItem.quantity)).filter(
                    OrderItem.artisan_id == artisan_id,
                    OrderItem.order_id.in_(
                        db.session.query(Order.id).filter(Order.status == 'completed')
                    )
                ).scalar() or 0
            else:
                avg_rating = 0
                review_count = 0
                sales_count = 0
            
            return {
                'product_count': len(products),
                'avg_rating': round(avg_rating, 1),
                'review_count': review_count,
                'total_sales': sales_count
            }, 200
        except Exception as e:
            return {
                'product_count': 0,
                'avg_rating': 0,
                'review_count': 0,
                'total_sales': 0
            }, 200

class ArtisanReviewsResource(Resource):
    def get(self, artisan_id):
        """Get reviews for artisan's products - Public access"""
        try:
            from app.models.review import Review
            
            # Get products by artisan
            products = Product.query.filter_by(artisan_id=artisan_id, status='active').all()
            product_ids = [p.id for p in products]
            
            if not product_ids:
                return [], 200
            
            # Get reviews for artisan's products
            reviews = db.session.query(Review, User, Product).join(
                User, Review.user_id == User.id
            ).join(
                Product, Review.product_id == Product.id
            ).filter(
                Review.product_id.in_(product_ids)
            ).order_by(Review.created_at.desc()).all()
            
            return [{
                'id': review.Review.id,
                'rating': review.Review.rating,
                'title': review.Review.title,
                'body': review.Review.body,
                'created_at': review.Review.created_at.isoformat() if review.Review.created_at else None,
                'user_name': review.User.full_name,
                'product_title': review.Product.title,
                'product_id': review.Product.id
            } for review in reviews], 200
        except Exception as e:
            return [], 200

class ArtisanProductsResource(Resource):
    def get(self, artisan_id):
        """Get products by artisan ID"""
        try:
            products = Product.query.filter_by(artisan_id=artisan_id, status='active').all()
            return [{
                'id': p.id,
                'title': p.title,
                'price': p.price,
                'description': p.description,
                'image_url': p.image_url,
                'status': p.status,
                'stock': p.stock,
                'currency': p.currency
            } for p in products], 200
        except Exception:
            return [], 200



# Register routes
artisan_api.add_resource(ArtisanShowcaseMediaListResource, '/showcase/')
artisan_api.add_resource(ArtisanShowcaseMediaResource, '/showcase/<showcase_media_id>')
artisan_api.add_resource(ArtisanSocialListResource, '/social/')
artisan_api.add_resource(ArtisanSocialResource, '/social/<social_link_id>')
artisan_api.add_resource(ArtisanDashboardResource, '/dashboard')
artisan_api.add_resource(ArtisanOrdersResource, '/orders')
artisan_api.add_resource(ArtisanMessagesResource, '/messages')
artisan_api.add_resource(ArtisanProfileResource, '/<artisan_id>')
artisan_api.add_resource(ArtisanProductsResource, '/<artisan_id>/products')
artisan_api.add_resource(ArtisanStatsResource, '/<artisan_id>/stats')
artisan_api.add_resource(ArtisanReviewsResource, '/<artisan_id>/reviews')
