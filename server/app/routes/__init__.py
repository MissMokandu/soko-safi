from .user_routes import user_bp
from .product_routes import product_bp
from .order_routes import order_bp
from .cart_routes import cart_bp
from .category_routes import category_bp
from .review_routes import review_bp
from .message_routes import message_bp
from .payment_routes import payment_bp
from .favorite_routes import favorite_bp

def register_blueprints(app):
