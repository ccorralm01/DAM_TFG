from flask import jsonify, request
from flask_jwt_extended import (
    jwt_required, get_jwt_identity
)
from datetime import datetime
from models import session, Category, Transaction, TransactionKind

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
    
    @jwt_required()
    def get_transactions(self):
        user_id = get_jwt_identity()
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
    
    @jwt_required()
    def create_transaction(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        
        try:
            transaction_kind = TransactionKind(data['kind'])
        except ValueError:
            return jsonify({'msg': 'Tipo de transacción inválido'}), 400
        
        category_id = data.get('category_id')
        if category_id:
            category = session.query(Category).filter_by(id=category_id, user_id=user_id).first()
            if not category:
                return jsonify({'msg': 'Categoría no encontrada'}), 404
        
        transaction = Transaction(
            amount=data['amount'],
            description=data.get('description'),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            kind=transaction_kind,
            category_id=category_id,
            user_id=user_id
        )
        
        session.add(transaction)
        session.commit()
        
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
    
    @jwt_required()
    def get_transaction(self, transaction_id):
        user_id = get_jwt_identity()
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
    
    @jwt_required()
    def update_transaction(self, transaction_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        
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
        
        session.commit()
        
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
    
    @jwt_required()
    def delete_transaction(self, transaction_id):
        user_id = get_jwt_identity()
        transaction = session.query(Transaction).filter_by(id=transaction_id, user_id=user_id).first()
        
        if not transaction:
            return jsonify({'msg': 'Transacción no encontrada'}), 404
        
        session.delete(transaction)
        session.commit()
        
        return jsonify({'msg': 'Transacción eliminada'})
    
    @jwt_required()
    def get_transactions_summary(self):
        user_id = get_jwt_identity()
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        transactions = session.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= datetime(current_year, current_month, 1).date(),
            Transaction.date <= datetime(current_year, current_month + 1, 1).date() if current_month < 12 
                else datetime(current_year + 1, 1, 1).date()
        ).all()
        
        income = sum(t.amount for t in transactions if t.kind == TransactionKind.income)
        expenses = sum(t.amount for t in transactions if t.kind == TransactionKind.expense)
        
        categories_summary = {}
        for t in transactions:
            if t.kind == TransactionKind.expense and t.category_id:
                category = session.get(Category, t.category_id)
                if category:
                    cat_name = category.name
                    categories_summary[cat_name] = categories_summary.get(cat_name, 0) + t.amount
        
        return jsonify({
            'month': current_month,
            'year': current_year,
            'income': income,
            'expenses': expenses,
            'balance': income - expenses,
            'categories': categories_summary
        })
