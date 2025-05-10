from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import session, Category, Transaction, TransactionKind
from contextlib import contextmanager
from sqlalchemy import func
from components.history import HistoryController
class TransactionController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/transactions', view_func=self.get_transactions, methods=['GET'])
        self.app.add_url_rule('/transactions', view_func=self.create_transaction, methods=['POST'])
        self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.get_transaction, methods=['GET'])
        self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.update_transaction, methods=['PUT'])
        self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.delete_transaction, methods=['DELETE'])
        self.app.add_url_rule('/transactions/summary', view_func=self.get_transactions_summary, methods=['GET'])

    @contextmanager
    def _session_scope(self):
        """Provides transactional scope around a series of operations."""
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.remove()
    
    @jwt_required()
    def get_transactions(self):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                transactions = session.query(Transaction).filter_by(user_id=user_id).all()
                
                return jsonify([{
                    'id': t.id,
                    'amount': t.amount,
                    'description': t.description,
                    'date': t.date.isoformat(),
                    'kind': t.kind.value,
                    'category_id': t.category_id,
                    'created_at': t.created_at.isoformat(),
                    'updated_at': t.updated_at.isoformat()
                } for t in transactions])
        except Exception as e:
            print(f"Error al recuperar transaciones: {e}")
            return jsonify({'msg': 'Error al obtener transacciones'}), 500
    
    @jwt_required()
    def create_transaction(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        try:
            transaction_kind = TransactionKind(data['kind'])
        except ValueError:
            return jsonify({'msg': 'Tipo de transacción inválido'}), 400
        
        try:
            with self._session_scope():
                category_id = data.get('category_id')
                if category_id:
                    category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
                    if not category:
                        return jsonify({'msg': 'Categoría no encontrada'}), 404
                
                # Convertir la fecha a objeto date
                transaction_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                
                transaction = Transaction(
                    amount=data['amount'],
                    description=data.get('description'),
                    date=transaction_date,
                    kind=transaction_kind,
                    category_id=category_id,
                    user_id=user_id
                )
                
                session.add(transaction)
                
                # Actualizar los historiales
                HistoryController._update_month_history(user_id, transaction_date)
                HistoryController._update_year_history(user_id, transaction_date)
                
                return jsonify({
                    'msg': 'Transacción creada',
                    'transaction': {
                        'id': transaction.id,
                        'amount': transaction.amount,
                        'description': transaction.description,
                        'date': transaction.date.isoformat(),
                        'kind': transaction.kind.value,
                        'category_id': transaction.category_id
                    }
                }), 201
        except Exception as e:
            print(f"Error al crear transacción: {e}")
            return jsonify({'msg': 'Error al crear transacción'}), 500
    
    @jwt_required()
    def get_transaction(self, transaction_id):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                transaction = session.query(Transaction).filter_by(id=transaction_id, user_id=user_id).first()
                
                if not transaction:
                    return jsonify({'msg': 'Transacción no encontrada'}), 404
                    
                return jsonify({
                    'id': transaction.id,
                    'amount': transaction.amount,
                    'description': transaction.description,
                    'date': transaction.date.isoformat(),
                    'kind': transaction.kind.value,
                    'category_id': transaction.category_id,
                    'created_at': transaction.created_at.isoformat(),
                    'updated_at': transaction.updated_at.isoformat()
                })
        except Exception as e:
            print(f"Error al obtener transación: {e}")
            return jsonify({'msg': 'Error al obtener transacción'}), 500
    
    @jwt_required()
    def update_transaction(self, transaction_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        try:
            with self._session_scope():
                transaction = session.query(Transaction).filter_by(id=transaction_id, user_id=user_id).first()
                
                if not transaction:
                    return jsonify({'msg': 'Transacción no encontrada'}), 404
                
                if 'amount' in data:
                    transaction.amount = data['amount']
                if 'description' in data:
                    transaction.description = data['description']
                if 'date' in data:
                    transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                if 'kind' in data:
                    try:
                        transaction.kind = TransactionKind(data['kind'])
                    except ValueError:
                        return jsonify({'msg': 'Tipo de transacción inválido'}), 400
                if 'category_id' in data:
                    category_id = data['category_id']
                    if category_id:
                        category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
                        if not category:
                            return jsonify({'msg': 'Categoría no encontrada'}), 404
                    transaction.category_id = category_id
                
                return jsonify({
                    'msg': 'Transacción actualizada',
                    'transaction': {
                        'id': transaction.id,
                        'amount': transaction.amount,
                        'description': transaction.description,
                        'date': transaction.date.isoformat(),
                        'kind': transaction.kind.value,
                        'category_id': transaction.category_id
                    }
                })
                
        except Exception as e:
            print(f"Error al actualizar transación: {e}")
            return jsonify({'msg': 'Error al actualizar transacción'}), 500
    
    @jwt_required()
    def delete_transaction(self, transaction_id):
        user_id = get_jwt_identity()
        try:
            with self._session_scope():
                transaction = session.query(Transaction).filter_by(id=transaction_id, user_id=user_id).first()
                
                if not transaction:
                    return jsonify({'msg': 'Transacción no encontrada'}), 404
                
                session.delete(transaction)
                
                return jsonify({'msg': 'Transacción eliminada'})
        except Exception as e:
            print(f"Error al eliminar transación: {e}")
            return jsonify({'msg': 'Error al eliminar transacción'}), 500
    
    @jwt_required()
    def get_transactions_summary(self):
        user_id = get_jwt_identity()
        
        # Obtener parámetros de fecha del request
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        try:
            # Parsear fechas o usar valores por defecto (mes actual)
            now = datetime.now()
            if start_date_str:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            else:
                start_date = datetime(now.year, now.month, 1).date()
                
            if end_date_str:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            else:
                if now.month < 12:
                    end_date = datetime(now.year, now.month + 1, 1).date()
                else:
                    end_date = datetime(now.year + 1, 1, 1).date()
            
            with self._session_scope():
                # Obtener transacciones en el rango de fechas
                transactions = session.query(Transaction).filter(
                    Transaction.user_id == user_id,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                ).all()
                
                # Calcular totales
                income = sum(t.amount for t in transactions if t.kind == TransactionKind.income)
                expenses = sum(t.amount for t in transactions if t.kind == TransactionKind.expense)
                
                # Preparar resumen por categorías como arrays de objetos
                income_categories = []
                expense_categories = []
                
                # Diccionarios temporales para acumular los montos por categoría
                temp_income = {}
                temp_expense = {}
                # Diccionarios para guardar los colores de cada categoría
                category_colors = {}
                
                for t in transactions:
                    if t.category_id:
                        category = session.get(Category, t.category_id)
                        if category:
                            cat_name = category.name
                            # Guardamos el color la primera vez que encontramos la categoría
                            if cat_name not in category_colors:
                                category_colors[cat_name] = category.color
                            
                            if t.kind == TransactionKind.income:
                                temp_income[cat_name] = temp_income.get(cat_name, 0) + t.amount
                            else:
                                temp_expense[cat_name] = temp_expense.get(cat_name, 0) + t.amount
                
                # Convertir los diccionarios temporales a arrays de objetos incluyendo el color
                income_categories = [{
                    'category': k, 
                    'amount': float(v),
                    'color': category_colors.get(k)
                } for k, v in temp_income.items()]
                
                expense_categories = [{
                    'category': k, 
                    'amount': float(v),
                    'color': category_colors.get(k)
                } for k, v in temp_expense.items()]
                
                return jsonify({
                    'summary': {
                        'income': float(income),
                        'expenses': float(expenses),
                        'balance': float(income - expenses)
                    },
                    'categories': {
                        'income': income_categories,
                        'expenses': expense_categories
                    }
                })
                
        except ValueError as e:
            return jsonify({'msg': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        except Exception as e:
            print(f"Error al obtener resumen de transacciones: {e}")
            return jsonify({'msg': 'Error al obtener resumen de transacciones'}), 500