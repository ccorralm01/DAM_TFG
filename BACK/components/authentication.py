import re
from flask import jsonify, request
from sqlalchemy.sql import exists
import bcrypt
from flask_jwt_extended import (
    create_access_token, set_access_cookies,
    jwt_required, get_jwt_identity, unset_jwt_cookies
)
from contextlib import contextmanager
from models import session, User, UserSettings

class AuthController:
    def __init__(self, app):
        self.app = app
        self.MAX_USERNAME_LENGTH = 15
        self._register_routes()
    
    def _register_routes(self):
        # Registro
        self.app.add_url_rule('/register', view_func=self.register, methods=['POST'])
        # Inicio de sesión
        self.app.add_url_rule('/login', view_func=self.login, methods=['POST'])
        # Cierre de sesión
        self.app.add_url_rule('/logout', view_func=self.logout, methods=['POST'])
        # Recuperar datos del perfil
        self.app.add_url_rule('/profile', view_func=self.profile, methods=['GET'])
        # Comprobar autenticación
        self.app.add_url_rule('/check-auth', view_func=self.check_auth, methods=['GET'])


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
            
    def register(self):
            data = request.get_json()
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if len(username) > self.MAX_USERNAME_LENGTH:
                return jsonify({'msg': f'El nombre de usuario no puede exceder los {self.MAX_USERNAME_LENGTH} caracteres ({len(username)})'}), 400
            
            # Validación de campos requeridos
            if not username or not email or not password:
                return jsonify({"msg": "Todos los campos son requeridos"}), 400

            # Validación del formato del email
            if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
                return jsonify({"msg": "El formato del email no es válido"}), 400

            # Validación del nombre de usuario
            if len(username) < 3 or len(username) > 20:
                return jsonify({"msg": "El nombre de usuario debe tener entre 3 y 20 caracteres"}), 400
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                return jsonify({"msg": "El nombre de usuario solo puede contener letras, números y guiones bajos"}), 400

            # Validación de la contraseña (consistente con el frontend)
            if len(password) < 8:
                return jsonify({
                    "msg": "La contraseña debe tener al menos 8 caracteres",
                    "validation": {
                        "length": False,
                        "lowercase": any(c.islower() for c in password),
                        "number": any(c.isdigit() for c in password),
                        "specialChar": bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
                    }
                }), 400
            if not any(c.islower() for c in password):
                return jsonify({
                    "msg": "La contraseña debe contener al menos una letra minúscula",
                    "validation": {
                        "length": len(password) >= 8,
                        "lowercase": False,
                        "number": any(c.isdigit() for c in password),
                        "specialChar": bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
                    }
                }), 400
            if not any(c.isdigit() for c in password):
                return jsonify({
                    "msg": "La contraseña debe contener al menos un número",
                    "validation": {
                        "length": len(password) >= 8,
                        "lowercase": any(c.islower() for c in password),
                        "number": False,
                        "specialChar": bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
                    }
                }), 400
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                return jsonify({
                    "msg": "La contraseña debe contener al menos un carácter especial (!@#$%^&*)",
                    "validation": {
                        "length": len(password) >= 8,
                        "lowercase": any(c.islower() for c in password),
                        "number": any(c.isdigit() for c in password),
                        "specialChar": False
                    }
                }), 400

            try:
                user_id = None
                with self._session_scope() as session:
                    # Verificar si el usuario o email ya existen
                    if session.query(exists().where(User.email == email)).scalar():
                        return jsonify({"msg": "El email ya está registrado"}), 409

                    if session.query(exists().where(User.username == username)).scalar():
                        return jsonify({"msg": "El nombre de usuario ya está en uso"}), 409

                    # Hashear la contraseña
                    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

                    # Crear nuevo usuario
                    new_user = User(
                        username=username,
                        email=email,
                        password=hashed_password.decode('utf-8')
                    )
                    session.add(new_user)
                    session.flush()  # Asegurarse de que el ID se genere
                    user_id = new_user.id

                    # Crear configuración de usuario con USD como moneda predeterminada
                    user_settings = UserSettings(
                        user_id=user_id,
                    )
                    session.add(user_settings)

                access_token = create_access_token(identity=str(user_id))

                response = jsonify({
                    "msg": "Registro exitoso",
                    "user": {
                        "id": user_id,
                        "username": username,
                        "email": email
                    }
                })
                set_access_cookies(response, access_token)
                return response, 201

            except Exception as e:
                print(f"Error en el registro: {str(e)}")
                return jsonify({"msg": f"Error en el servidor: {str(e)}"}), 500
            
    def login(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        try:
            with self._session_scope():
                user = session.query(User).filter_by(email=email).first()
                if not user:
                    return jsonify({"msg": "Credenciales inválidas"}), 401

                # Comparar la contraseña
                if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                    return jsonify({"msg": "Credenciales inválidas"}), 401

                access_token = create_access_token(identity=str(user.id))

                response = jsonify({
                    "msg": "Login exitoso",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email
                    }
                })
                set_access_cookies(response, access_token)
                return response

        except Exception as e:
            print(f"Error en el login: {str(e)}")
            return jsonify({"msg": "Error en el servidor"}), 500

    def logout(self):
        response = jsonify({'msg': 'Sesión cerrada con éxito!'})
        unset_jwt_cookies(response)
        return response
    
    @jwt_required()
    def profile(self):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                user = session.get(User, user_id)
                if not user:
                    return jsonify({'msg': 'Usuario no encontrado'}), 404

                return jsonify({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'created_at': user.created_at.isoformat()
                })
        except Exception as e:
            print(f"Error al obtener el perfil: {str(e)}")
            return jsonify({"msg": "Error en el servidor"}), 500
    
    @jwt_required(optional=True)
    def check_auth(self):
        user_id = get_jwt_identity()
        if user_id:
            return jsonify({'logged_in': True, 'user_id': user_id})
        return jsonify({'logged_in': False})
    
    def check_email(self):
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"msg": "El campo 'email' es requerido"}), 400
        
        try:
            with self._session_scope():
                exists_email = session.query(exists().where(User.email == email)).scalar()
                return jsonify({"exists": exists_email})
        except Exception as e:
            return jsonify({"msg": "Error en el servidor"}), 500
    
    def check_username(self):
        data = request.get_json()
        username = data.get("username")
        if not username:
            return jsonify({"msg": "El campo 'username' es requerido"}), 400
        
        try:
            with self._session_scope():
                exists_username = session.query(exists().where(User.username == username)).scalar()
                return jsonify({"exists": exists_username})
        except Exception as e:
            return jsonify({"msg": "Error en el servidor"}), 500