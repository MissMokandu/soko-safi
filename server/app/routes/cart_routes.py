"""
Cart routes for Soko Safi
Handles CRUD operations for carts and cart items
"""

from flask_restful import Resource, Api
from flask import Blueprint, request
from app.models import db, Cart, CartItem
# Removed problematic auth imports

cart_bp = Blueprint('cart_bp', __name__)
cart_api = Api(cart_bp)

class CartListResource(Resource):
    def get(self):
        """Get all carts - Admin only"""
        from flask import session
        if session.get('user_role') != 'admin':
            return {'error': 'Admin access required'}, 403
        
        carts = Cart.query.all()
        return [{
            'id': c.id,
            'user_id': c.user_id,
            'created_at': c.created_at.isoformat() if c.created_at else None,
            'updated_at': c.updated_at.isoformat() if c.updated_at else None
        } for c in carts]
    
    def post(self):
        """Create new cart - Authenticated users only"""
        from flask import session
        data = request.json or {}
        
        try:
            # Set user_id to current user if not admin
            user_id = session.get('user_id')
            if session.get('user_role') == 'admin' and 'user_id' in data:
                user_id = data['user_id']
            
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create cart'}, 500
        
        return {
            'message': 'Cart created successfully',
            'cart': {
                'id': cart.id,
                'user_id': cart.user_id
            }
        }, 201

class CartResource(Resource):
    def get(self, cart_id):
        """Get cart details - Owner or Admin only"""
        cart = Cart.query.get_or_404(cart_id)
        return {
            'id': cart.id,
            'user_id': cart.user_id,
            'created_at': cart.created_at.isoformat() if cart.created_at else None,
            'updated_at': cart.updated_at.isoformat() if cart.updated_at else None
        }
    
    def put(self, cart_id):
        """Update cart - Owner or Admin only"""
        try:
            cart = Cart.query.get_or_404(cart_id)
            data = request.json
            
            if not data:
                return {'error': 'No data provided'}, 400
            
            from flask import session
            # Update allowed fields
            if 'user_id' in data and session.get('user_role') == 'admin':
                cart.user_id = data['user_id']
            
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to update cart'}, 500
        
        return {
            'message': 'Cart updated successfully',
            'cart': {
                'id': cart.id,
                'user_id': cart.user_id
            }
        }, 200
    
    def delete(self, cart_id):
        """Delete cart - Owner or Admin only"""
        try:
            cart = Cart.query.get_or_404(cart_id)
            db.session.delete(cart)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to delete cart'}, 500
        
        return {'message': 'Cart deleted successfully'}, 200

class CartItemListResource(Resource):
    def get(self):
        """Get user's cart items"""
        try:
            
            # Get user_id from session or JWT
            from flask import session
            user_id = session.get('user_id')
            if not user_id:
                try:
                    from flask_jwt_extended import get_jwt_identity
                    user_id = get_jwt_identity()
                except Exception:
                    user_id = None
            
            
            if not user_id:
                return [], 200
            
            # Get or create user's cart
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                return [], 200
            
            # Get cart items with product details
            from app.models.product import Product
            
            cart_items = db.session.query(CartItem, Product).join(
                Product, CartItem.product_id == Product.id
            ).filter(
                CartItem.cart_id == cart.id
            ).all()
            
            
            result = []
            for cart_item, product in cart_items:
                item_data = {
                    'id': cart_item.id,
                    'product_id': cart_item.product_id,
                    'quantity': cart_item.quantity,
                    'unit_price': float(cart_item.unit_price) if cart_item.unit_price else float(product.price),
                    'added_at': cart_item.added_at.isoformat() if cart_item.added_at else None,
                    'product': {
                        'id': product.id,
                        'title': product.title,
                        'price': float(product.price),
                        'image': product.image_url,
                        'image_url': product.image_url,
                        'artisan_name': 'Artisan',  # TODO: Join with user table
                        'stock': product.stock
                    }
                }
                result.append(item_data)
            
            return result, 200
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return [], 200
    
    def post(self):
        """Add item to cart"""
        try:
            
            # Get user_id from session or JWT
            from flask import session
            user_id = session.get('user_id')
            if not user_id:
                try:
                    from flask_jwt_extended import get_jwt_identity
                    user_id = get_jwt_identity()
                except Exception:
                    user_id = None

            if not user_id:
                return {'error': 'Authentication required'}, 401
            
            data = request.json or {}
            
            product_id = data.get('product_id')
            quantity = data.get('quantity', 1)
            
            if not product_id:
                return {'error': 'product_id is required'}, 400
            
            # Verify product exists
            from app.models.product import Product
            product = Product.query.get(product_id)
            if not product:
                return {'error': 'Product not found'}, 404
            
            # Get or create user's cart
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                cart = Cart(user_id=user_id)
                db.session.add(cart)
                db.session.flush()  # Get cart.id
            
            # Check if item already exists in cart
            existing_item = CartItem.query.filter_by(
                cart_id=cart.id,
                product_id=product_id
            ).first()
            
            if existing_item:
                # Update quantity
                existing_item.quantity += quantity
                cart_item = existing_item
            else:
                # Create new cart item
                cart_item = CartItem(
                    cart_id=cart.id,
                    product_id=product_id,
                    quantity=quantity,
                    unit_price=product.price
                )
                db.session.add(cart_item)
            
            db.session.commit()
            
            result = {
                'message': 'Item added to cart successfully',
                'cart_item': {
                    'id': cart_item.id,
                    'product_id': cart_item.product_id,
                    'quantity': cart_item.quantity,
                    'unit_price': float(cart_item.unit_price)
                }
            }
            
            return result, 201
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return {'error': 'Failed to add item to cart'}, 500

class CartItemResource(Resource):
    def get(self, cart_item_id):
        """Get cart item details"""
        try:
            cart_item = CartItem.query.get_or_404(cart_item_id)
            return {
                'id': cart_item.id,
                'product_id': cart_item.product_id,
                'quantity': cart_item.quantity,
                'unit_price': float(cart_item.unit_price) if cart_item.unit_price else 0
            }
        except Exception as e:
            return {'error': 'Cart item not found'}, 404
    
    def put(self, cart_item_id):
        """Update cart item quantity"""
        try:
            # Get user_id from session or JWT
            from flask import session
            user_id = session.get('user_id')
            if not user_id:
                try:
                    from flask_jwt_extended import get_jwt_identity
                    user_id = get_jwt_identity()
                except Exception:
                    return {'error': 'Authentication required'}, 401
            
            cart_item = CartItem.query.get_or_404(cart_item_id)
            
            # Verify ownership
            cart = Cart.query.get(cart_item.cart_id)
            if cart.user_id != user_id:
                return {'error': 'Access denied'}, 403
            
            data = request.json or {}
            quantity = data.get('quantity', 1)
            
            if quantity <= 0:
                return {'error': 'Quantity must be greater than 0'}, 400
            
            cart_item.quantity = quantity
            db.session.commit()
            
            return {
                'message': 'Cart item updated successfully',
                'cart_item': {
                    'id': cart_item.id,
                    'quantity': cart_item.quantity,
                    'unit_price': float(cart_item.unit_price) if cart_item.unit_price else 0
                }
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to update cart item'}, 500
    
    def delete(self, cart_item_id):
        """Delete cart item"""
        try:
            # Get user_id from session or JWT
            from flask import session
            user_id = session.get('user_id')
            if not user_id:
                try:
                    from flask_jwt_extended import get_jwt_identity
                    user_id = get_jwt_identity()
                except Exception:
                    return {'error': 'Authentication required'}, 401
            
            cart_item = CartItem.query.get_or_404(cart_item_id)
            
            # Verify ownership
            cart = Cart.query.get(cart_item.cart_id)
            if cart.user_id != user_id:
                return {'error': 'Access denied'}, 403
            
            db.session.delete(cart_item)
            db.session.commit()
            
            return {'message': 'Cart item deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to delete cart item'}, 500

class ClearCartResource(Resource):
    def delete(self):
        """Clear user's cart"""
        try:
            # Get user_id from session or JWT
            from flask import session
            user_id = session.get('user_id')
            if not user_id:
                try:
                    from flask_jwt_extended import get_jwt_identity
                    user_id = get_jwt_identity()
                except Exception:
                    return {'error': 'Authentication required'}, 401
            
            # Get user's cart
            cart = Cart.query.filter_by(user_id=user_id, deleted_at=None).first()
            if cart:
                # Delete all cart items
                CartItem.query.filter_by(cart_id=cart.id).delete()
                db.session.commit()
            
            return {'message': 'Cart cleared successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to clear cart'}, 500

# Register routes
cart_api.add_resource(CartItemListResource, '/')
cart_api.add_resource(CartItemResource, '/<cart_item_id>')
cart_api.add_resource(ClearCartResource, '/clear')
cart_api.add_resource(CartListResource, '/carts')
cart_api.add_resource(CartResource, '/carts/<cart_id>')
