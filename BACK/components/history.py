from flask import jsonify
from flask_jwt_extended import (
    jwt_required, get_jwt_identity
)

from models import session, MonthHistory, YearHistory

class HistoryController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        self.app.add_url_rule('/history/monthly', view_func=self.get_monthly_history, methods=['GET'])
        self.app.add_url_rule('/history/yearly', view_func=self.get_yearly_history, methods=['GET'])
    
    @jwt_required()
    def get_monthly_history(self):
        user_id = get_jwt_identity()
        history = session.query(MonthHistory).filter_by(user_id=user_id).order_by(
            MonthHistory.year, MonthHistory.month
        ).all()
        
        return jsonify([{
            'month': h.month,
            'year': h.year,
            'income': h.income,
            'expense': h.expense,
            'balance': h.income - h.expense
        } for h in history])
    
    @jwt_required()
    def get_yearly_history(self):
        user_id = get_jwt_identity()
        history = session.query(YearHistory).filter_by(user_id=user_id).order_by(
            YearHistory.year
        ).all()
        
        return jsonify([{
            'year': h.year,
            'income': h.income,
            'expense': h.expense,
            'balance': h.income - h.expense
        } for h in history])
