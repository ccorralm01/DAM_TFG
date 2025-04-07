from flask import jsonify, request
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
        self.app.add_url_rule('/login', view_func=self.login, methods=['POST'])
        self.app.add_url_rule('/logout', view_func=self.logout, methods=['POST'])
        self.app.add_url_rule('/profile', view_func=self.profile, methods=['GET'])
        self.app.add_url_rule('/check-auth', view_func=self.check_auth, methods=['GET'])
    
    def login(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = session.query(User).filter_by(email=email, password=password).first()
        if not user:
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
