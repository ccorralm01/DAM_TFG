import re
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import session, UserSettings, User, Transaction
from contextlib import contextmanager
import bcrypt

class UserSettingsController:
    def __init__(self, app):
        self.app = app
        self.MAX_USERNAME_LENGTH = 15
        self._register_routes()
    
    def _register_routes(self):
        # Recuperar tipo de moneda
        self.app.add_url_rule('/settings', view_func=self.get_settings, methods=['GET'])
        # Actualizar tipo de moneda
        self.app.add_url_rule('/settings', view_func=self.update_settings, methods=['PUT'])
        # Actualizar perfil
        self.app.add_url_rule('/settings/profile', view_func=self.update_profile, methods=['PUT'])
        # Actualizar contraseña
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
                # Obtener la configuración actual del usuario
                settings = session.query(UserSettings).filter_by(user_id=user_id).first()
                old_currency = settings.currency if settings else 'EUR'
                new_currency = data.get('currency', old_currency)
                
                # Si hay cambio de moneda y se proporciona un factor de conversión
                if 'conversion_rate' in data and old_currency != new_currency:
                    conversion_rate = float(data['conversion_rate'])
                    
                    # Actualizar todos los montos de las transacciones
                    transactions = session.query(Transaction).filter_by(user_id=user_id).all()
                    for transaction in transactions:
                        transaction.amount = round(transaction.amount * conversion_rate, 2)
                
                # Actualizar o crear la configuración
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
                if len(data['username']) > self.MAX_USERNAME_LENGTH:
                    return jsonify({'msg': f'El nombre de usuario no puede exceder los {self.MAX_USERNAME_LENGTH} caracteres ({len(data['username'])})'}), 400
                
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
        """Actualiza la contraseña del usuario con validaciones robustas"""
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validación de campos requeridos
        required_fields = {'current_password', 'new_password', 'confirm_password'}
        if not data or not all(field in data for field in required_fields):
            return jsonify({'msg': 'Se requieren los campos: current_password, new_password y confirm_password'}), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        # Validaciones básicas
        if not current_password:
            return jsonify({'msg': 'La contraseña actual no puede estar vacía'}), 400
        
        if not new_password:
            return jsonify({'msg': 'La nueva contraseña no puede estar vacía'}), 400
        
        if new_password != confirm_password:
            return jsonify({
                'msg': 'Las nuevas contraseñas no coinciden',
                'validation': {
                    'passwordsMatch': False
                }
            }), 400
        
        # Validación de fortaleza de la nueva contraseña
        if len(new_password) < 8:
            return jsonify({
                'msg': 'La nueva contraseña debe tener al menos 8 caracteres',
                'validation': {
                    'length': False,
                    'lowercase': any(c.islower() for c in new_password),
                    'number': any(c.isdigit() for c in new_password),
                    'specialChar': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password)),
                    'passwordsMatch': new_password == confirm_password
                }
            }), 400
        
        if not any(c.islower() for c in new_password):
            return jsonify({
                'msg': 'La nueva contraseña debe contener al menos una letra minúscula',
                'validation': {
                    'length': len(new_password) >= 8,
                    'lowercase': False,
                    'number': any(c.isdigit() for c in new_password),
                    'specialChar': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password)),
                    'passwordsMatch': new_password == confirm_password
                }
            }), 400
        
        if not any(c.isdigit() for c in new_password):
            return jsonify({
                'msg': 'La nueva contraseña debe contener al menos un número',
                'validation': {
                    'length': len(new_password) >= 8,
                    'lowercase': any(c.islower() for c in new_password),
                    'number': False,
                    'specialChar': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password)),
                    'passwordsMatch': new_password == confirm_password
                }
            }), 400
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
            return jsonify({
                'msg': 'La nueva contraseña debe contener al menos un carácter especial (!@#$%^&*)',
                'validation': {
                    'length': len(new_password) >= 8,
                    'lowercase': any(c.islower() for c in new_password),
                    'number': any(c.isdigit() for c in new_password),
                    'specialChar': False,
                    'passwordsMatch': new_password == confirm_password
                }
            }), 400
        
        # Verificar que la nueva contraseña no sea igual a la actual
        if new_password == current_password:
            return jsonify({
                'msg': 'La nueva contraseña no puede ser igual a la actual',
                'validation': {
                    'notSameAsCurrent': False
                }
            }), 400
        
        try:
            with self._session_scope() as session:
                user = session.query(User).filter_by(id=user_id).first()
                if not user:
                    return jsonify({'msg': 'Usuario no encontrado'}), 404
                
                # Verificar contraseña actual
                if not bcrypt.checkpw(current_password.encode('utf-8'), user.password.encode('utf-8')):
                    return jsonify({'msg': 'La contraseña actual es incorrecta'}), 401
                
                # Hashear nueva contraseña
                hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
                user.password = hashed_password.decode('utf-8')
                
                return jsonify({
                    'msg': 'Contraseña actualizada correctamente',
                    'validation': {
                        'length': True,
                        'lowercase': True,
                        'number': True,
                        'specialChar': True,
                        'passwordsMatch': True,
                        'notSameAsCurrent': True
                    }
                }), 200
                
        except Exception as e:
            print(f"Error al actualizar contraseña: {e}")
            return jsonify({'msg': 'Error al actualizar contraseña'}), 500