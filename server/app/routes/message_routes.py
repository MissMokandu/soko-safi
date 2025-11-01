"""
Message routes for Soko Safi
Handles CRUD operations for messages
"""

from flask_restful import Resource, Api
from flask import Blueprint, request
from app.models import db, Message
from app.auth import require_auth, require_role, require_ownership_or_role

message_api = Api(message_bp)

class MessageListResource(Resource):
    @require_auth
    def get(self):
        """Get all messages - Admin only"""
        from flask import session
        if session.get('user_role') != 'admin':
            return {'error': 'Admin access required'}, 403
        
        messages = Message.query.filter_by(deleted_at=None).all()
        return [{
            'id': m.id,
            'sender_id': m.sender_id,
            'receiver_id': m.receiver_id,
            'message': m.message_text,
            'timestamp': m.created_at.isoformat() if m.created_at else None,
            'is_read': m.is_read
        } for m in messages]
    
    @require_auth
    def post(self):
        """Create new message - Authenticated users only"""
        from flask import session

        
        data = request.json or {}
        
        # Validate required fields
        if not data or 'receiver_id' not in data:
            return {'error': 'receiver_id is required'}, 400
        
        # Check if it's a text message or attachment
        message_text = data.get('message', '').strip()
        attachment_url = data.get('attachment_url')
        attachment_name = data.get('attachment_name')
        message_type_str = data.get('message_type', 'text')
        
        if not message_text and not attachment_url:
            return {'error': 'Either message text or attachment is required'}, 400
        
        # Message type is always text for now
        message_type = 'text'
        
        # Create message
        message = Message(
            sender_id=session.get('user_id'),
            receiver_id=data.get('receiver_id'),
            message_text=message_text or 'Sent attachment',
            media_url=attachment_url,
            status='sent'
        )
        
        try:
            db.session.add(message)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create message'}, 500
        
        return {
            'message': 'Message created successfully',
            'message_data': {
                'id': message.id,
                'sender_id': message.sender_id,
                'receiver_id': message.receiver_id,
                'message': message.message_text,
                'media_url': message.media_url,
                'status': message.status
            }
        }, 201

class MessageResource(Resource):
    @require_auth
    def get(self, message_id):
        """Get message details - Sender, Receiver, or Admin only"""
        message = Message.query.get_or_404(message_id)
        
        # Check if user is sender, receiver, or admin
        from flask import session
        current_user_id = session.get('user_id')
        user_role = session.get('user_role')
        
        if user_role != 'admin' and message.sender_id != current_user_id and message.receiver_id != current_user_id:
            return {'error': 'Access denied'}, 403
        
        return {
            'id': message.id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'message': message.message_text,
            'timestamp': message.created_at.isoformat() if message.created_at else None,
            'is_read': message.is_read
        }
    
    @require_auth
    def put(self, message_id):
        """Update message - Sender, Receiver, or Admin only"""
        message = Message.query.get_or_404(message_id)
        
        # Check if user is sender, receiver, or admin
        from flask import session
        current_user_id = session.get('user_id')
        user_role = session.get('user_role')
        
        if user_role != 'admin' and message.sender_id != current_user_id and message.receiver_id != current_user_id:
            return {'error': 'Access denied'}, 403
        
        data = request.json
        
        # Only allow updating is_read status for receiver or admin
        if 'is_read' in data and (message.receiver_id == current_user_id or user_role == 'admin'):
            message.is_read = data['is_read']
        
        # Only sender or admin can update message content
        if 'message' in data and (message.sender_id == current_user_id or user_role == 'admin'):
            message.message_text = data['message']
        
        if 'sender_id' in data and user_role == 'admin':
            message.sender_id = data['sender_id']
        if 'receiver_id' in data and user_role == 'admin':
            message.receiver_id = data['receiver_id']
        
        db.session.commit()
        
        return {
            'message': 'Message updated successfully',
            'message_data': {
                'id': message.id,
                'sender_id': message.sender_id,
                'receiver_id': message.receiver_id,
                'message': message.message_text,
                'is_read': message.is_read
            }
        }, 200
    
    @require_auth
    def delete(self, message_id):
        """Delete message - Sender, Receiver, or Admin only"""
        message = Message.query.get_or_404(message_id)
        
        # Check if user is sender, receiver, or admin
        from flask import session
        current_user_id = session.get('user_id')
        user_role = session.get('user_role')
        
        if user_role != 'admin' and message.sender_id != current_user_id and message.receiver_id != current_user_id:
            return {'error': 'Access denied'}, 403
        
        # Soft delete by updating status
        message.status = 'deleted'
        db.session.commit()
        
        return {'message': 'Message deleted successfully'}, 200

class MessageConversationsResource(Resource):
    @require_auth
    def get(self):
        """Get conversations for current user"""
        from flask import session
        from app.models import User
        from sqlalchemy import func, desc

        current_user_id = session.get('user_id')
        print(f"[BACKEND_CONVERSATIONS] Current user ID: {current_user_id}")
        print(f"[BACKEND_CONVERSATIONS] Session data: {dict(session)}")

        # Get latest message for each conversation partner
        subquery = db.session.query(
            func.greatest(Message.sender_id, Message.receiver_id).label('user1'),
            func.least(Message.sender_id, Message.receiver_id).label('user2'),
            func.max(Message.created_at).label('latest_timestamp')
        ).filter(
            db.or_(
                Message.sender_id == current_user_id,
                Message.receiver_id == current_user_id
            )
        ).group_by('user1', 'user2').subquery()

        # Get the actual latest messages
        latest_messages = db.session.query(Message).join(
            subquery,
            db.and_(
                Message.created_at == subquery.c.latest_timestamp,
                db.or_(
                    db.and_(
                        Message.sender_id == subquery.c.user1,
                        Message.receiver_id == subquery.c.user2
                    ),
                    db.and_(
                        Message.sender_id == subquery.c.user2,
                        Message.receiver_id == subquery.c.user1
                    )
                )
            )
        ).order_by(desc(Message.created_at)).all()

        conversations = []
        print(f"[BACKEND_CONVERSATIONS] Found {len(latest_messages)} latest messages")
        
        for msg in latest_messages:
            partner_id = msg.receiver_id if msg.sender_id == current_user_id else msg.sender_id
            partner = User.query.get(partner_id)
            
            print(f"[BACKEND_CONVERSATIONS] Processing message with partner_id: {partner_id}")
            print(f"[BACKEND_CONVERSATIONS] Partner found: {partner is not None}")
            
            if partner:
                # Count unread messages from this partner
                unread_count = Message.query.filter_by(
                    sender_id=partner_id,
                    receiver_id=current_user_id,
                    is_read=False
                ).count()

                # Get user avatar from profile or generate one
                avatar_url = partner.profile_picture_url if hasattr(partner, 'profile_picture_url') and partner.profile_picture_url else f'https://ui-avatars.com/api/?name={partner.full_name or "User"}&background=6366f1&color=fff'
                
                conversation = {
                    'id': partner_id,
                    'artisan': {
                        'id': partner_id,
                        'name': partner.full_name or 'Unknown User',
                        'avatar': avatar_url,
                        'online': False  # TODO: Implement online status
                    },
                    'lastMessage': msg.message_text,
                    'lastMessageTime': msg.created_at.isoformat() if msg.created_at else '',
                    'timestamp': msg.created_at.isoformat() if msg.created_at else '',
                    'created_at': msg.created_at.isoformat() if msg.created_at else '',
                    'unread': unread_count
                }
                
                print(f"[BACKEND_CONVERSATIONS] Added conversation: {conversation}")
                conversations.append(conversation)

        print(f"[BACKEND_CONVERSATIONS] Returning {len(conversations)} conversations")
        return conversations

class ConversationMessagesResource(Resource):
    @require_auth
    def get(self, user_id):
        """Get messages in conversation with specific user"""
        from flask import session
        from app.models import User

        current_user_id = session.get('user_id')
        
        # Get all messages between current user and specified user
        messages = Message.query.filter(
            db.or_(
                db.and_(Message.sender_id == current_user_id, Message.receiver_id == user_id),
                db.and_(Message.sender_id == user_id, Message.receiver_id == current_user_id)
            )
        ).order_by(Message.created_at.asc()).limit(100).all()  # Limit to last 100 messages for performance

        # Mark messages from the other user as read and delivered
        Message.query.filter_by(
            sender_id=user_id,
            receiver_id=current_user_id,
            is_read=False
        ).update({
            'is_read': True,
            'status': 'read'
        })
        db.session.commit()

        formatted_messages = []
        for msg in messages:
            
            formatted_messages.append({
                'id': msg.id,
                'sender': 'buyer' if msg.sender_id == current_user_id else 'artisan',
                'text': msg.message_text,
                'time': msg.created_at.strftime('%H:%M') if msg.created_at else '',
                'timestamp': msg.created_at.isoformat() if msg.created_at else '',
                'created_at': msg.created_at.isoformat() if msg.created_at else '',
                'message_type': 'text',
                'attachment_url': msg.media_url,
                'attachment_name': None,
                'status': msg.status or 'sent',
                'is_read': msg.is_read
            })
            

        return formatted_messages

class MessageStatusResource(Resource):
    @require_auth
    def put(self, message_id):
        """Update message status (delivered/read)"""
        from flask import session

        
        message = Message.query.get_or_404(message_id)
        current_user_id = session.get('user_id')
        
        # Only receiver can update status
        if message.receiver_id != current_user_id:
            return {'error': 'Access denied'}, 403
        
        data = request.json or {}
        
        if 'status' in data:
            try:
                message.status = data['status']
                if data['status'] == 'read':
                    message.is_read = True
                db.session.commit()
            except ValueError:
                return {'error': 'Invalid status'}, 400
        
        return {
            'message': 'Status updated successfully',
            'status': message.status
        }, 200

class ConversationInitResource(Resource):
    @require_auth
    def post(self, user_id):
        """Initialize conversation with a user"""
        from flask import session
        from app.models import User
        
        current_user_id = session.get('user_id')
        
        # Check if target user exists
        target_user = User.query.get(user_id)
        if not target_user:
            return {'error': 'User not found'}, 404
        
        # Check if conversation already exists
        existing_message = Message.query.filter(
            db.or_(
                db.and_(Message.sender_id == current_user_id, Message.receiver_id == user_id),
                db.and_(Message.sender_id == user_id, Message.receiver_id == current_user_id)
            )
        ).first()
        
        if existing_message:
            # Conversation exists, return conversation info
            avatar_url = target_user.profile_picture_url if hasattr(target_user, 'profile_picture_url') and target_user.profile_picture_url else f'https://ui-avatars.com/api/?name={target_user.full_name or "User"}&background=6366f1&color=fff'
            
            return {
                'conversation': {
                    'id': user_id,
                    'artisan': {
                        'id': user_id,
                        'name': target_user.full_name or 'Unknown User',
                        'avatar': avatar_url,
                        'online': False
                    },
                    'lastMessage': existing_message.message_text,
                    'lastMessageTime': existing_message.created_at.isoformat() if existing_message.created_at else '',
                    'timestamp': existing_message.created_at.isoformat() if existing_message.created_at else '',
                    'created_at': existing_message.created_at.isoformat() if existing_message.created_at else '',
                    'unread': 0
                }
            }, 200
        
        # No conversation exists, create placeholder conversation
        avatar_url = target_user.profile_picture_url if hasattr(target_user, 'profile_picture_url') and target_user.profile_picture_url else f'https://ui-avatars.com/api/?name={target_user.full_name or "User"}&background=6366f1&color=fff'
        
        return {
            'conversation': {
                'id': user_id,
                'artisan': {
                    'id': user_id,
                    'name': target_user.full_name or 'Unknown User',
                    'avatar': avatar_url,
                    'online': False
                },
                'lastMessage': 'Start a conversation...',
                'lastMessageTime': '',
                'timestamp': '',
                'created_at': '',
                'unread': 0
            }
        }, 201

# Register routes
message_api.add_resource(MessageListResource, '/')
message_api.add_resource(MessageResource, '/<message_id>')
message_api.add_resource(MessageStatusResource, '/<message_id>/status')
message_api.add_resource(MessageConversationsResource, '/conversations')
message_api.add_resource(ConversationMessagesResource, '/conversation/<user_id>')
message_api.add_resource(ConversationInitResource, '/init/<user_id>')