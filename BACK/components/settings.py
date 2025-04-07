from flask import jsonify, request
from flask_jwt_extended import (
    jwt_required, get_jwt_identity
)
from models import session, UserSettings


class UserSettingsController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/settings', view_func=self.get_settings, methods=['GET'])
        self.app.add_url_rule('/settings', view_func=self.update_settings, methods=['PUT'])
    
    @jwt_required()
    def get_settings(self):
        user_id = get_jwt_identity()
        settings = session.query(UserSettings).filter_by(user_id=user_id).first()
        
        if not settings:
            return jsonify({'msg': 'Configuración no encontrada'}), 404
            
        return jsonify({
            'currency': settings.currency
        })
    
    @jwt_required()
    def update_settings(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        settings = session.query(UserSettings).filter_by(user_id=user_id).first()
        
        if not settings:
            settings = UserSettings(user_id=user_id, currency=data.get('currency', 'EUR'))
            session.add(settings)
        else:
            settings.currency = data.get('currency', settings.currency)
        
        session.commit()
        
        return jsonify({
            'msg': 'Configuración actualizada',
            'settings': {
                'currency': settings.currency
            }
        })
