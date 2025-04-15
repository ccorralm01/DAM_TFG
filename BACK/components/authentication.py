from flask import jsonify, request
from sqlalchemy.sql import exists
import bcrypt
from flask_jwt_extended import ( 
    create_access_token, set_access_cookies,
    jwt_required, get_jwt_identity, unset_jwt_cookies
)

from models import session, User

class AuthController:
    def __init__(self, app, jwt):
        self.app = app
        self.jwt = jwt
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/register', view_func=self.register, methods=['POST'])
        self.app.add_url_rule('/login', view_func=self.login, methods=['POST'])
        self.app.add_url_rule('/logout', view_func=self.logout, methods=['POST'])
        self.app.add_url_rule('/profile', view_func=self.profile, methods=['GET'])
        self.app.add_url_rule('/check-auth', view_func=self.check_auth, methods=['GET'])
        self.app.add_url_rule('/check-email', view_func=self.check_email, methods=['POST'])
        self.app.add_url_rule('/check-username', view_func=self.check_username, methods=['POST'])

    def register(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({"msg": "Todos los campos son requeridos"}), 400

        # Verificar si ya existen
        if session.query(exists().where(User.email == email)).scalar():
            return jsonify({"msg": "El email ya está registrado"}), 409

        if session.query(exists().where(User.username == username)).scalar():
            return jsonify({"msg": "El nombre de usuario ya está en uso"}), 409

        # Hashear la contraseña
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        new_user = User(username=username, email=email, password=hashed_password.decode('utf-8'))
        session.add(new_user)
        session.commit()

        access_token = create_access_token(identity=str(new_user.id))

        response = jsonify({
            "msg": "Registro exitoso",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email
            }
        })
        set_access_cookies(response, access_token)
        return response, 201

    
    
    def login(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

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

    
    def logout(self):
        response = jsonify({'msg': 'Logout exitoso'})
        unset_jwt_cookies(response)
        return response
    
    @jwt_required()
    def profile(self):
        user_id = get_jwt_identity()
        user = session.get(User, user_id)
        if not user:
            return jsonify({'msg': 'Usuario no encontrado'}), 404

        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        })
    
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
        
        exists_email = session.query(exists().where(User.email == email)).scalar()
        return jsonify({"exists": exists_email})
    
    def check_username(self):
        data = request.get_json()
        username = data.get("username")
        if not username:
            return jsonify({"msg": "El campo 'username' es requerido"}), 400
        
        exists_username = session.query(exists().where(User.username == username)).scalar()
        return jsonify({"exists": exists_username})
