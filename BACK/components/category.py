from flask import jsonify, request
from flask_jwt_extended import (
    jwt_required, get_jwt_identity
)
from models import session, Category, CategoryType


class CategoryController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/categories', view_func=self.get_categories, methods=['GET'])
        self.app.add_url_rule('/categories', view_func=self.create_category, methods=['POST'])
        self.app.add_url_rule('/categories/<int:category_id>', view_func=self.get_category, methods=['GET'])
        self.app.add_url_rule('/categories/<int:category_id>', view_func=self.update_category, methods=['PUT'])
        self.app.add_url_rule('/categories/<int:category_id>', view_func=self.delete_category, methods=['DELETE'])
    
    @jwt_required()
    def get_categories(self):
        user_id = get_jwt_identity()
        categories = session.query(Category).filter_by(user_id=user_id).all()
        
        return jsonify([{
            'id': cat.id,
            'name': cat.name,
            'icon': cat.icon,
            'type': cat.type.value,
            'created_at': cat.created_at.isoformat()
        } for cat in categories])
    
    @jwt_required()
    def create_category(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        try:
            category_type = CategoryType(data['type'])
        except ValueError:
            return jsonify({'msg': 'Tipo de categoría inválido'}), 400
        
        category = Category(
            name=data['name'],
            icon=data.get('icon'),
            type=category_type,
            user_id=user_id
        )
        
        session.add(category)
        session.commit()
        
        return jsonify({
            'msg': 'Categoría creada',
            'category': {
                'id': category.id,
                'name': category.name,
                'icon': category.icon,
                'type': category.type.value
            }
        }), 201
    
    @jwt_required()
    def get_category(self, category_id):
        user_id = get_jwt_identity()
        category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
        
        if not category:
            return jsonify({'msg': 'Categoría no encontrada'}), 404
            
        return jsonify({
            'id': category.id,
            'name': category.name,
            'icon': category.icon,
            'type': category.type.value,
            'created_at': category.created_at.isoformat()
        })
    
    @jwt_required()
    def update_category(self, category_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
        
        if not category:
            return jsonify({'msg': 'Categoría no encontrada'}), 404
        
        if 'name' in data:
            category.name = data['name']
        if 'icon' in data:
            category.icon = data['icon']
        if 'type' in data:
            try:
                category.type = CategoryType(data['type'])
            except ValueError:
                return jsonify({'msg': 'Tipo de categoría inválido'}), 400
        
        session.commit()
        
        return jsonify({
            'msg': 'Categoría actualizada',
            'category': {
                'id': category.id,
                'name': category.name,
                'icon': category.icon,
                'type': category.type.value
            }
        })
    
    @jwt_required()
    def delete_category(self, category_id):
        user_id = get_jwt_identity()
        category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
        
        if not category:
            return jsonify({'msg': 'Categoría no encontrada'}), 404
        
        session.delete(category)
        session.commit()
        
        return jsonify({'msg': 'Categoría eliminada'})
