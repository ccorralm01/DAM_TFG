from flask import jsonify, request
from flask_jwt_extended import (
    jwt_required, get_jwt_identity
)
from models import session, Category, CategoryType
from contextlib import contextmanager


class CategoryController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        # Recuperar categorías
        self.app.add_url_rule('/categories', view_func=self.get_categories, methods=['GET'])
        # Crear categoría
        self.app.add_url_rule('/categories', view_func=self.create_category, methods=['POST'])
        # Recuperar categoría
        self.app.add_url_rule('/categories/<int:category_id>', view_func=self.get_category, methods=['GET'])
        # Actualizar categoría
        self.app.add_url_rule('/categories/<int:category_id>', view_func=self.update_category, methods=['PUT'])
        # Eliminar categoría
        self.app.add_url_rule('/categories/<int:category_id>', view_func=self.delete_category, methods=['DELETE'])

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
    def get_categories(self):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                categories = session.query(Category).filter_by(user_id=user_id).all()
                
                return jsonify([{
                    'id': cat.id,
                    'name': cat.name,
                    'color': cat.color,
                    'type': cat.type.value,
                    'created_at': cat.created_at.isoformat()
                } for cat in categories])
        except Exception as e:
            return jsonify({'msg': 'Error al obtener categorías'}), 500
    
    @jwt_required()
    def create_category(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        try:
            category_type = CategoryType(data['type'])
        except ValueError:
            return jsonify({'msg': 'Tipo de categoría inválido'}), 400
        
        try:
            with self._session_scope():
                category = Category(
                    name=data['name'],
                    color=data.get('color'),
                    type=category_type,
                    user_id=user_id
                )
                
                session.add(category)
                session.flush() # Para obtener el ID generado automáticamente
                
                return jsonify({
                    'msg': 'Categoría creada',
                    'category': {
                        'id': category.id,
                        'name': category.name,
                        'color': category.color,
                        'type': category.type.value
                    }
                }), 201
        except Exception as e:
            print("Error al crear categoría:", e)
            return jsonify({'msg': 'Error al crear categoría'}), 500
    
    @jwt_required()
    def get_category(self, category_id):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
                
                if not category:
                    return jsonify({'msg': 'Categoría no encontrada'}), 404
                    
                return jsonify({
                    'id': category.id,
                    'name': category.name,
                    'color': category.color,
                    'type': category.type.value,
                    'created_at': category.created_at.isoformat()
                })
        except Exception as e:
            return jsonify({'msg': 'Error al obtener categoría'}), 500
    
    @jwt_required()
    def update_category(self, category_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        try:
            with self._session_scope():
                category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
                
                if not category:
                    return jsonify({'msg': 'Categoría no encontrada'}), 404
                
                if 'name' in data:
                    category.name = data['name']
                if 'color' in data:
                    category.color = data['color']
                if 'type' in data:
                    try:
                        category.type = CategoryType(data['type'])
                    except ValueError:
                        return jsonify({'msg': 'Tipo de categoría inválido'}), 400
                                
                return jsonify({
                    'msg': 'Categoría actualizada',
                    'category': {
                        'id': category.id,
                        'name': category.name,
                        'color': category.color,
                        'type': category.type.value
                    }
                })
        except Exception as e:
            return jsonify({'msg': 'Error al actualizar categoría'}), 500
    
    @jwt_required()
    def delete_category(self, category_id):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
                
                if not category:
                    return jsonify({'msg': 'Categoría no encontrada'}), 404
                
                session.delete(category)
                
                return jsonify({'msg': 'Categoría eliminada'})
        except Exception as e:
            return jsonify({'msg': 'Error al eliminar categoría'}), 500
