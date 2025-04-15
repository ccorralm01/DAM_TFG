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

class TriruleAPI:
    def __init__(self):
        self.app = Flask(__name__)
        self._configure_app()
        self._initialize_extensions()
        self._register_controllers()
        self._create_tables()
        
    def _configure_app(self):
        self.app.config['JWT_SECRET_KEY'] = 'supersecret-key'
        self.app.config['JWT_TOKEN_LOCATION'] = ['cookies']
        self.app.config['JWT_COOKIE_SECURE'] = False
        self.app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
        self.app.config['JWT_COOKIE_CSRF_PROTECT'] = False
        self.app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
        
    def _initialize_extensions(self):
        CORS(self.app, supports_credentials=True)
        self.jwt = JWTManager(self.app)
        
    def _create_tables(self):
        Base.metadata.create_all(engine)
    
    def _register_controllers(self):
        self.app.add_url_rule('/', view_func=lambda: jsonify({'msg': 'API Trirule funcionando'}))
        
        # Inicializar controladores
        AuthController(self.app, self.jwt)
        UserSettingsController(self.app)
        CategoryController(self.app)
        TransactionController(self.app)
        HistoryController(self.app)
    
    def run(self, debug=False):
        self.app.run(debug=debug)

if __name__ == '__main__':
    api = TriruleAPI()
    api.run(debug=True)
    

"""
    self.app.add_url_rule('/', view_func=self.index)
    self.app.add_url_rule('/register', view_func=self.register, methods=['POST'])
    self.app.add_url_rule('/login', view_func=self.login, methods=['POST'])
    self.app.add_url_rule('/logout', view_func=self.logout, methods=['POST'])
    self.app.add_url_rule('/profile', view_func=self.profile, methods=['GET'])
    self.app.add_url_rule('/check-auth', view_func=self.check_auth, methods=['GET'])

    # User settings routes
    self.app.add_url_rule('/settings', view_func=self.get_settings, methods=['GET'])
    self.app.add_url_rule('/settings', view_func=self.update_settings, methods=['PUT'])

    # Category routes
    self.app.add_url_rule('/categories', view_func=self.get_categories, methods=['GET'])
    self.app.add_url_rule('/categories', view_func=self.create_category, methods=['POST'])
    self.app.add_url_rule('/categories/<int:category_id>', view_func=self.get_category, methods=['GET'])
    self.app.add_url_rule('/categories/<int:category_id>', view_func=self.update_category, methods=['PUT'])
    self.app.add_url_rule('/categories/<int:category_id>', view_func=self.delete_category, methods=['DELETE'])

    # Transaction routes
    self.app.add_url_rule('/transactions', view_func=self.get_transactions, methods=['GET'])
    self.app.add_url_rule('/transactions', view_func=self.create_transaction, methods=['POST'])
    self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.get_transaction, methods=['GET'])
    self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.update_transaction, methods=['PUT'])
    self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.delete_transaction, methods=['DELETE'])
    self.app.add_url_rule('/transactions/summary', view_func=self.get_transactions_summary, methods=['GET'])

    # History routes
    self.app.add_url_rule('/history/monthly', view_func=self.get_monthly_history, methods=['GET'])
    self.app.add_url_rule('/history/yearly', view_func=self.get_yearly_history, methods=['GET'])
"""