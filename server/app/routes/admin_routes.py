"""
Admin routes for Soko Safi
Handles admin-only operations like user management, platform statistics, etc.
"""

from flask import Blueprint, request, jsonify
from flask_restful import Resource, Api
from app.models import db, User, Product, Category, Order, Review
from app.auth import require_auth, require_role, get_current_user
from sqlalchemy import func, desc
from datetime import datetime, timedelta

admin_bp = Blueprint('admin_bp', __name__)
admin_api = Api(admin_bp)

class AdminDashboardResource(Resource):
    """Admin dashboard with platform statistics"""
    
    @require_role('admin')
    def get(self):
        try:
            # Get platform statistics
            total_users = User.query.filter_by(deleted_at=None).count()
            total_artisans = User.query.filter_by(role='artisan', deleted_at=None).count()
            total_buyers = User.query.filter_by(role='buyer', deleted_at=None).count()
            total_products = Product.query.filter_by(deleted_at=None).count()
            total_orders = Order.query.count()
            total_categories = Category.query.filter_by(deleted_at=None).count()
            
            # Recent activity (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_users = User.query.filter(
                User.created_at >= thirty_days_ago,
                User.deleted_at.is_(None)
            ).count()
            recent_products = Product.query.filter(
                Product.created_at >= thirty_days_ago,
                Product.deleted_at.is_(None)
            ).count()
            recent_orders = Order.query.filter(Order.placed_at >= thirty_days_ago).count()
            
            return {
                'platform_stats': {
                    'total_users': total_users,
                    'total_artisans': total_artisans,
                    'total_buyers': total_buyers,
                    'total_products': total_products,
                    'total_orders': total_orders,
                    'total_categories': total_categories
                },
                'recent_activity': {
                    'new_users_30d': recent_users,
                    'new_products_30d': recent_products,
                    'new_orders_30d': recent_orders
                }
            }, 200
            
        except Exception as e:
            return {
                'error': 'Failed to fetch dashboard data',
                'message': str(e)
            }, 500

class AdminUsersResource(Resource):
    """Manage users - list, update, delete"""
    
    @require_role('admin')
    def get(self):
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            role_filter = request.args.get('role')
            
            query = User.query.filter_by(deleted_at=None)
            
            if role_filter:
                query = query.filter_by(role=role_filter)
            
            users = query.order_by(desc(User.created_at)).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'users': [{
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role.value,
                    'is_verified': user.is_verified,
                    'created_at': user.created_at.isoformat() if user.created_at else None,
                    'location': user.location,
                    'profile_picture_url': user.profile_picture_url
                } for user in users.items],
                'pagination': {
                    'page': users.page,
                    'pages': users.pages,
                    'per_page': users.per_page,
                    'total': users.total
                }
            }, 200
            
        except Exception as e:
            return {
                'error': 'Failed to fetch users',
                'message': str(e)
            }, 500

class AdminUserResource(Resource):
    """Manage individual user"""
    
    @require_role('admin')
    def get(self, user_id):
        try:
            user = User.query.filter_by(id=user_id, deleted_at=None).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            return {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role.value,
                    'phone': user.phone,
                    'location': user.location,
                    'description': user.description,
                    'is_verified': user.is_verified,
                    'created_at': user.created_at.isoformat() if user.created_at else None,
                    'updated_at': user.updated_at.isoformat() if user.updated_at else None
                }
            }, 200
            
        except Exception as e:
            return {
                'error': 'Failed to fetch user',
                'message': str(e)
            }, 500
    
    @require_role('admin')
    def put(self, user_id):
        try:
            user = User.query.filter_by(id=user_id, deleted_at=None).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            data = request.get_json()
            
            # Update allowed fields
            if 'is_verified' in data:
                user.is_verified = data['is_verified']
            if 'role' in data and data['role'] in ['buyer', 'artisan', 'admin']:
                user.role = data['role']
            
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {
                'message': 'User updated successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role.value,
                    'is_verified': user.is_verified
                }
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Failed to update user',
                'message': str(e)
            }, 500
    
    @require_role('admin')
    def delete(self, user_id):
        try:
            user = User.query.filter_by(id=user_id, deleted_at=None).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            # Soft delete
            user.deleted_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'User deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Failed to delete user',
                'message': str(e)
            }, 500

class AdminProductsResource(Resource):
    """Manage products"""
    
    @require_role('admin')
    def get(self):
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            status_filter = request.args.get('status')
            
            query = Product.query.filter_by(deleted_at=None)
            
            if status_filter:
                query = query.filter_by(status=status_filter)
            
            products = query.order_by(desc(Product.created_at)).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'products': [{
                    'id': product.id,
                    'title': product.title,
                    'price': float(product.price) if product.price else 0,
                    'status': product.status,
                    'stock': product.stock,
                    'artisan_id': product.artisan_id,
                    'created_at': product.created_at.isoformat() if product.created_at else None
                } for product in products.items],
                'pagination': {
                    'page': products.page,
                    'pages': products.pages,
                    'per_page': products.per_page,
                    'total': products.total
                }
            }, 200
            
        except Exception as e:
            return {
                'error': 'Failed to fetch products',
                'message': str(e)
            }, 500

class AdminProductResource(Resource):
    """Manage individual product"""
    
    @require_role('admin')
    def put(self, product_id):
        try:
            product = Product.query.filter_by(id=product_id, deleted_at=None).first()
            if not product:
                return {'error': 'Product not found'}, 404
            
            data = request.get_json()
            
            # Update product status (approve/reject)
            if 'status' in data:
                product.status = data['status']
            
            product.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {
                'message': 'Product updated successfully',
                'product': {
                    'id': product.id,
                    'title': product.title,
                    'status': product.status
                }
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Failed to update product',
                'message': str(e)
            }, 500
    
    @require_role('admin')
    def delete(self, product_id):
        try:
            product = Product.query.filter_by(id=product_id, deleted_at=None).first()
            if not product:
                return {'error': 'Product not found'}, 404
            
            # Soft delete
            product.deleted_at = datetime.utcnow()
            db.session.commit()
            
            return {'message': 'Product deleted successfully'}, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Failed to delete product',
                'message': str(e)
            }, 500

# Register routes
admin_api.add_resource(AdminDashboardResource, '/dashboard')
admin_api.add_resource(AdminUsersResource, '/users')
admin_api.add_resource(AdminUserResource, '/users/<user_id>')
admin_api.add_resource(AdminProductsResource, '/products')
admin_api.add_resource(AdminProductResource, '/products/<product_id>')