from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import session, MonthHistory, YearHistory, Transaction, TransactionKind
from sqlalchemy import and_
from contextlib import contextmanager
from datetime import timedelta

class HistoryController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/history/monthly', view_func=self.get_monthly_history, methods=['GET'])
        self.app.add_url_rule('/history/yearly', view_func=self.get_yearly_history, methods=['GET'])

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
    def get_monthly_history(self):
        user_id = get_jwt_identity()
        year = request.args.get('year')
        month = request.args.get('month')
        
        try:
            with self._session_scope():
                query = session.query(MonthHistory).filter_by(user_id=user_id)
                
                if year:
                    query = query.filter(MonthHistory.year == int(year))
                if month:
                    query = query.filter(MonthHistory.month == int(month))
                    
                history = query.order_by(MonthHistory.year, MonthHistory.month).all()
                
                return jsonify([{
                    'day': h.day,
                    'month': h.month,
                    'year': h.year,
                    'income': h.income,
                    'expense': h.expense,
                    'balance': h.income - h.expense
                } for h in history])
        
        except ValueError:
            return jsonify({'msg': 'Parámetros year/month deben ser números enteros'}), 400
        except Exception as e:
            print(f"Error al obtener historial mensual: {e}")
            return jsonify({'msg': 'Error al obtener historial mensual'}), 500
    
    @jwt_required()
    def get_yearly_history(self):
        user_id = get_jwt_identity()
        year = request.args.get('year')
        
        try:
            with self._session_scope():
                query = session.query(YearHistory).filter_by(user_id=user_id)
                
                if year:
                    query = query.filter(YearHistory.year == int(year))
                    
                history = query.order_by(YearHistory.year, YearHistory.month).all()
                
                return jsonify([{
                    'month': h.month,
                    'year': h.year,
                    'income': h.income,
                    'expense': h.expense,
                    'balance': h.income - h.expense
                } for h in history])
        
        except ValueError:
            return jsonify({'msg': 'El parámetro year debe ser un número entero'}), 400
        except Exception as e:
            print(f"Error al obtener historial anual: {e}")
            return jsonify({'msg': 'Error al obtener historial anual'}), 500
        

    @staticmethod
    def _update_month_history(user_id, date):
        day_transactions = session.query(Transaction).filter_by(
            user_id=user_id,
            date=date
        ).all()

        month_history = session.query(MonthHistory).filter_by(
            user_id=user_id,
            day=date.day,
            month=date.month,
            year=date.year
        ).first()

        if not month_history:
            month_history = MonthHistory(
                user_id=user_id,
                day=date.day,
                month=date.month,
                year=date.year,
                income=0,
                expense=0
            )
            session.add(month_history)

        month_history.income = sum(
            t.amount for t in day_transactions 
            if t.kind == TransactionKind.income
        )
        month_history.expense = sum(
            t.amount for t in day_transactions 
            if t.kind == TransactionKind.expense
        )

    @staticmethod
    def _update_year_history(user_id, date):
        first_day = date.replace(day=1)
        last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        month_transactions = session.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= first_day,
            Transaction.date <= last_day
        ).all()

        year_history = session.query(YearHistory).filter_by(
            user_id=user_id,
            month=date.month,
            year=date.year
        ).first()

        if not year_history:
            year_history = YearHistory(
                user_id=user_id,
                month=date.month,
                year=date.year,
                income=0,
                expense=0
            )
            session.add(year_history)

        year_history.income = sum(
            t.amount for t in month_transactions 
            if t.kind == TransactionKind.income
        )
        year_history.expense = sum(
            t.amount for t in month_transactions 
            if t.kind == TransactionKind.expense
        )