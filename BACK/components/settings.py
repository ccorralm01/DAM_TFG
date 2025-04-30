from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import session, UserSettings
from contextlib import contextmanager

class UserSettingsController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/settings', view_func=self.get_settings, methods=['GET'])
        self.app.add_url_rule('/settings', view_func=self.update_settings, methods=['PUT'])

    @contextmanager
    def _session_scope(self):
        """Proporciona un contexto transaccional para la sesión."""
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.remove()
    
    @jwt_required()
    def get_settings(self):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                settings = session.query(UserSettings).filter_by(user_id=user_id).first()
                
                if not settings:
                    return jsonify({'msg': 'Configuración no encontrada'}), 404
                    
                return jsonify({
                    'currency': settings.currency
                })
        except Exception as e:
            print(f"Error al obtener configuración: {e}")
            return jsonify({'msg': 'Error al obtener configuración'}), 500
    
    @jwt_required()
    def update_settings(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'currency' not in data:
            return jsonify({'msg': 'El campo currency es requerido'}), 400
        
        try:
            with self._session_scope():
                settings = session.query(UserSettings).filter_by(user_id=user_id).first()
                
                if not settings:
                    settings = UserSettings(
                        user_id=user_id, 
                        currency=data.get('currency', 'EUR')
                    )
                    session.add(settings)
                else:
                    settings.currency = data.get('currency', settings.currency)
                                
                return jsonify({
                    'msg': 'Configuración actualizada',
                    'settings': {
                        'currency': settings.currency
                    }
                })
        except Exception as e:
            print(f"Error al actualizar configuración: {e}")
            return jsonify({'msg': 'Error al actualizar configuración'}), 500