import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

from components.authentication import AuthController
from components.settings import UserSettingsController
from components.category import CategoryController
from components.transaction import TransactionController
from components.history import HistoryController
from models import Base, engine
from dotenv import load_dotenv
load_dotenv()
class TriruleAPI:
    def __init__(self):
        self.app = Flask(__name__)
        self._configure_app()
        self._initialize_extensions()
        self._register_controllers()
        self._create_tables()
        
    def _configure_app(self):
        self.app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
        self.app.config['JWT_TOKEN_LOCATION'] = ['cookies']
        self.app.config['JWT_COOKIE_SECURE'] = False
        self.app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
        self.app.config['JWT_COOKIE_CSRF_PROTECT'] = False
        self.app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
        
    def _initialize_extensions(self):
        CORS(self.app, supports_credentials=True)
        self.jwt = JWTManager(self.app)
        
    def _create_tables(self):
        try:
            Base.metadata.create_all(engine)
        except Exception as e:
            print(f"Error en la base de datos: {e}")
    
    def _register_controllers(self):
        self.app.add_url_rule('/', view_func=lambda: jsonify({'msg': 'API Trirule funcionando'}))
        
        # Inicializar controladores
        AuthController(self.app)
        UserSettingsController(self.app)
        CategoryController(self.app)
        TransactionController(self.app)
        HistoryController(self.app)
    
    def run(self, debug=False):
        self.app.run(host="0.0.0.0", debug=debug)

if __name__ == '__main__':
    api = TriruleAPI()
    api.run(debug=True)

