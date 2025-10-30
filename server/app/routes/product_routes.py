from flask_restful import Resource, Api
from flask import Blueprint, request, make_response
from app.models import db, Product
from app.auth import require_auth, require_role, require_ownership_or_role
from datetime import datetime
from flask import session # Added to avoid potential circular import if not imported earlier

# --- CORS Configuration ---
# Since you're using credentials, Access-Control-Allow-Origin must be specific.
ALLOWED_ORIGIN = 'http://localhost:5174' # Replace with your actual frontend origin

def _add_cors_headers(response):
    """Helper function to add common CORS headers."""
    response.headers.add('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

def _handle_options_preflight(methods):
    """Generates a proper OPTIONS response for a preflight request."""
    response = make_response('', 200)
    response.headers.add('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
    response.headers.add('Access-Control-Allow-Methods', methods)
    # Include headers that your client might send in the actual request (like Content-Type, Authorization, etc.)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization') 
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    # Cache the preflight response for a period (e.g., 24 hours = 86400 seconds)
    response.headers.add('Access-Control-Max-Age', '86400') 
    return response

# --------------------------

product_bp = Blueprint('product_bp', __name__)
product_api = Api(product_bp)

# --- ProductListResource ---
class ProductListResource(Resource):
    
    def options(self):
        """Handle CORS preflight for /products (GET, POST)"""
        # Allow GET (public) and POST (authenticated)
        return _handle_options_preflight('GET, POST') 

    def get(self):
        """Get all products - Public access"""
        try:
            products = Product.query.filter_by(deleted_at=None).all()
            response_data = [{
                'id': p.id,
                'artisan_id': p.artisan_id,
                'title': p.title,
                'price': float(p.price) if p.price else 0,
                'description': p.description,
                'stock': p.stock,
                'currency': p.currency,
                'created_at': p.created_at.isoformat() if p.created_at else None
            } for p in products]
            
            response = make_response(response_data, 200)
            return _add_cors_headers(response) # Apply CORS headers
        
        except Exception as e:
            response = make_response({'error': 'Failed to fetch products'}, 500)
            return _add_cors_headers(response)


    @require_role('artisan', 'admin')
    def post(self):
        """Create new product - Artisan or Admin only"""
        try:
            data = request.json
            if not data:
                response = make_response({'error': 'No data provided'}, 400)
                return _add_cors_headers(response)
            
            # Set artisan_id to current user if not admin
            if session.get('user_role') != 'admin':
                data['artisan_id'] = session.get('user_id')
            
            product = Product(**data)
            db.session.add(product)
            db.session.commit()
            
            response = make_response({'id': product.id}, 201)
            return _add_cors_headers(response) # Apply CORS headers
            
        except Exception as e:
            db.session.rollback()
            response = make_response({'error': 'Failed to create product'}, 500)
            return _add_cors_headers(response)

# --- ProductResource ---
class ProductResource(Resource):
    
    def options(self):
        """Handle CORS preflight for /products/<product_id> (GET, PUT, DELETE)"""
        # Allow GET (public), PUT (authenticated), and DELETE (authenticated)
        return _handle_options_preflight('GET, PUT, DELETE')

    def get(self, product_id):
        """Get product details - Public access"""
        try:
            product = Product.query.get_or_404(product_id)
            response_data = {
                'id': product.id,
                'artisan_id': product.artisan_id,
                'title': product.title,
                'price': float(product.price) if product.price else 0,
                'description': product.description,
                'stock': product.stock,
                'currency': product.currency,
                'created_at': product.created_at.isoformat() if product.created_at else None
            }
            response = make_response(response_data, 200)
            return _add_cors_headers(response) # Apply CORS headers
            
        except Exception as e:
            response = make_response({'error': 'Product not found'}, 404)
            return _add_cors_headers(response)

    @require_ownership_or_role('artisan_id', 'admin')
    def put(self, product_id):
        """Update product - Owner (artisan) or Admin only"""
        try:
            product = Product.query.get_or_404(product_id)
            data = request.json
            
            if not data:
                response = make_response({'error': 'No data provided'}, 400)
                return _add_cors_headers(response)
            
            # Update allowed fields
            # ... (omitted for brevity, assume update logic is correct)
            if 'title' in data: product.title = data['title']
            if 'description' in data: product.description = data['description']
            if 'price' in data: 
                if data['price'] < 0:
                    response = make_response({'error': 'Price cannot be negative'}, 400)
                    return _add_cors_headers(response)
                product.price = data['price']
            if 'stock' in data: 
                if data['stock'] < 0:
                    response = make_response({'error': 'Stock cannot be negative'}, 400)
                    return _add_cors_headers(response)
                product.stock = data['stock']
            if 'currency' in data: product.currency = data['currency']

            db.session.commit()
            
            response_data = {
                'message': 'Product updated successfully',
                'product': {
                    'id': product.id,
                    'artisan_id': product.artisan_id,
                    'title': product.title,
                    'price': float(product.price),
                    'description': product.description,
                    'stock': product.stock,
                    'currency': product.currency
                }
            }
            response = make_response(response_data, 200)
            return _add_cors_headers(response) # Apply CORS headers
            
        except Exception as e:
            db.session.rollback()
            response = make_response({'error': 'Failed to update product'}, 500)
            return _add_cors_headers(response)

    @require_ownership_or_role('artisan_id', 'admin')
    def delete(self, product_id):
        """Delete product - Owner (artisan) or Admin only"""
        try:
            product = Product.query.get_or_404(product_id)
            product.deleted_at = datetime.utcnow()
            db.session.commit()
            
            response = make_response({'message': 'Product deleted successfully'}, 200)
            return _add_cors_headers(response) # Apply CORS headers
            
        except Exception as e:
            db.session.rollback()
            response = make_response({'error': 'Failed to delete product'}, 500)
            return _add_cors_headers(response)

product_api.add_resource(ProductListResource, '/')
product_api.add_resource(ProductResource, '/<product_id>')