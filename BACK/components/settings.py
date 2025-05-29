from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import session, UserSettings, User, Transaction
from contextlib import contextmanager
import bcrypt

class UserSettingsController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/settings', view_func=self.get_settings, methods=['GET'])
        self.app.add_url_rule('/settings', view_func=self.update_settings, methods=['PUT'])
        self.app.add_url_rule('/settings/profile', view_func=self.update_profile, methods=['PUT'])
        self.app.add_url_rule('/settings/password', view_func=self.update_password, methods=['PUT'])

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
                # 1. Obtener la configuración actual del usuario
                settings = session.query(UserSettings).filter_by(user_id=user_id).first()
                old_currency = settings.currency if settings else 'EUR'
                new_currency = data.get('currency', old_currency)
                
                # 2. Si hay cambio de moneda y se proporciona un factor de conversión
                if 'conversion_rate' in data and old_currency != new_currency:
                    conversion_rate = float(data['conversion_rate'])
                    
                    # 3. Actualizar todos los montos de las transacciones
                    transactions = session.query(Transaction).filter_by(user_id=user_id).all()
                    for transaction in transactions:
                        transaction.amount = round(transaction.amount * conversion_rate, 2)
                
                # 4. Actualizar o crear la configuración
                if not settings:
                    settings = UserSettings(
                        user_id=user_id, 
                        currency=new_currency
                    )
                    session.add(settings)
                else:
                    settings.currency = new_currency
                                
                return jsonify({
                    'msg': 'Configuración y transacciones actualizadas',
                    'settings': {
                        'currency': settings.currency
                    }
                })
        except Exception as e:
            print(f"Error al actualizar configuración: {e}")
            return jsonify({'msg': 'Error al actualizar configuración'}), 500
        
    @jwt_required()
    def update_profile(self):
        """Actualiza el perfil del usuario (username y email)"""
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'msg': 'No se proporcionaron datos para actualizar'}), 400
        
        allowed_fields = {'username', 'email'}
        if not any(field in data for field in allowed_fields):
            return jsonify({'msg': 'Se requiere al menos uno de los campos: username o email'}), 400
        
        try:
            with self._session_scope():
                user = session.query(User).filter_by(id=user_id).first()
                if not user:
                    return jsonify({'msg': 'Usuario no encontrado'}), 404
                
                updated_fields = {}
                
                if 'username' in data and data['username']:
                    user.username = data['username']
                    updated_fields['username'] = user.username
                
                if 'email' in data and data['email']:
                    existing_user = session.query(User).filter(
                        User.email == data['email'],
                        User.id != user_id
                    ).first()
                    if existing_user:
                        return jsonify({'msg': 'El email ya está en uso por otro usuario'}), 400
                    user.email = data['email']
                    updated_fields['email'] = user.email
                
                if not updated_fields:
                    return jsonify({'msg': 'No se proporcionaron campos válidos para actualizar'}), 400
                
                return jsonify({
                    'msg': 'Perfil actualizado correctamente',
                    'updated_fields': updated_fields
                })
                
        except Exception as e:
            print(f"Error al actualizar perfil: {e}")
            return jsonify({'msg': 'Error al actualizar perfil'}), 500

    @jwt_required()
    def update_password(self):
        """Actualiza la contraseña del usuario"""
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = {'current_password', 'new_password'}
        if not data or not all(field in data for field in required_fields):
            return jsonify({'msg': 'Se requieren los campos current_password y new_password'}), 400
        
        if not data['new_password']:
            return jsonify({'msg': 'La nueva contraseña no puede estar vacía'}), 400
        
        try:
            with self._session_scope():
                user = session.query(User).filter_by(id=user_id).first()
                if not user:
                    return jsonify({'msg': 'Usuario no encontrado'}), 404
                
                # Verificar contraseña actual
                if not bcrypt.checkpw(data['current_password'].encode('utf-8'), user.password.encode('utf-8')):
                    return jsonify({'msg': 'La contraseña actual es incorrecta'}), 401
                
                # Hashear nueva contraseña
                hashed_password = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
                user.password = hashed_password.decode('utf-8')
                
                return jsonify({'msg': 'Contraseña actualizada correctamente'})
                
        except Exception as e:
            print(f"Error al actualizar contraseña: {e}")
            return jsonify({'msg': 'Error al actualizar contraseña'}), 500