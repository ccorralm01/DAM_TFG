from flask import jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import session, Category, Transaction, TransactionKind, CategoryType
from contextlib import contextmanager
from sqlalchemy import func
from components.history import HistoryController
from io import BytesIO
import pandas as pd
from werkzeug.utils import secure_filename
import random
class TransactionController:
    def __init__(self, app):
        self.app = app
        self._register_routes()
    
    def _register_routes(self):
        # Recuperar transacciones
        self.app.add_url_rule('/transactions', view_func=self.get_transactions, methods=['GET'])
        # Crear transacción
        self.app.add_url_rule('/transactions', view_func=self.create_transaction, methods=['POST'])
        # Recuperar transacción
        self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.get_transaction, methods=['GET'])
        # Actualizar transacción
        self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.update_transaction, methods=['PUT'])
        # Eliminar transacción
        self.app.add_url_rule('/transactions/<int:transaction_id>', view_func=self.delete_transaction, methods=['DELETE'])
        # Recuperar resumen de transacciones
        self.app.add_url_rule('/transactions/summary', view_func=self.get_transactions_summary, methods=['GET'])
        # Exportar
        self.app.add_url_rule('/transactions/export', view_func=self.export_transactions, methods=['GET'])
        # Importar
        self.app.add_url_rule('/transactions/import', view_func=self.import_transactions, methods=['POST'])

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
                # Obtenemos todas las transacciones del usuario
                transactions = session.query(Transaction).filter_by(user_id=user_id).all()
                
                # Obtenemos todas las categorías del usuario para evitar N+1 queries
                categories = session.query(Category).filter_by(user_id=user_id).all()
                categories_dict = {cat.id: cat for cat in categories}
                
                return jsonify([{
                    'id': t.id,
                    'amount': t.amount,
                    'description': t.description,
                    'date': t.date.isoformat(),
                    'kind': t.kind.value,
                    'category': {
                        'id': categories_dict[t.category_id].id,
                        'name': categories_dict[t.category_id].name,
                        'color': categories_dict[t.category_id].color,
                        'type': categories_dict[t.category_id].type.value,
                        'created_at': categories_dict[t.category_id].created_at.isoformat()
                    } if t.category_id and t.category_id in categories_dict else None,
                    'created_at': t.created_at.isoformat(),
                    'updated_at': t.updated_at.isoformat()
                } for t in transactions])
        except Exception as e:
            print(f"Error al recuperar transacciones: {e}")
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
                session.flush()
                
                # Actualizar los historiales
                HistoryController._update_month_history(user_id, transaction.date)
                HistoryController._update_year_history(user_id, transaction.date)
                
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
        
    @jwt_required()
    def export_transactions(self):
        """Exporta las transacciones del usuario a un archivo Excel sin IDs internos"""
        user_id = get_jwt_identity()
        
        try:
            with self._session_scope():
                # Obtener transacciones con información de categoría
                transactions = session.query(
                    Transaction,
                    Category.name.label('category_name'),
                    Category.color.label('category_color'),
                    Category.type.label('category_type')
                ).outerjoin(
                    Category, Transaction.category_id == Category.id
                ).filter(
                    Transaction.user_id == user_id
                ).all()

                # Preparar datos para el DataFrame
                data = []
                for t, cat_name, cat_color, cat_type in transactions:
                    data.append({
                        'Fecha': t.date.strftime('%Y-%m-%d'),
                        'Descripción': t.description or '',
                        'Categoría': cat_name or '',
                        'Color Categoría': cat_color or '',
                        'Tipo Categoría': cat_type.value if cat_type else '',
                        'Tipo Transacción': t.kind.value,
                        'Cantidad': float(t.amount),
                        'Creado': t.created_at.strftime('%Y-%m-%d %H:%M'),
                        'Actualizado': t.updated_at.strftime('%Y-%m-%d %H:%M')
                    })

                # Crear DataFrame y ordenar por fecha
                df = pd.DataFrame(data)
                df.sort_values(by='Fecha', ascending=False, inplace=True)

                # Crear archivo Excel en memoria
                output = BytesIO()
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    df.to_excel(writer, sheet_name='Transacciones', index=False)
                    
                    # Formatear columnas
                    workbook = writer.book
                    worksheet = writer.sheets['Transacciones']
                    
                    # Ajustar ancho de columnas
                    for column in df:
                        column_length = max(df[column].astype(str).map(len).max(), len(column))
                        col_idx = df.columns.get_loc(column)
                        worksheet.column_dimensions[chr(65 + col_idx)].width = column_length + 2

                output.seek(0)
                
                # Enviar archivo como descarga
                return send_file(
                    output,
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    as_attachment=True,
                    download_name=f'transacciones_{datetime.now().strftime("%Y%m%d")}.xlsx'
                )

        except Exception as e:
            print(f"Error al exportar transacciones: {e}")
            return jsonify({'msg': 'Error al exportar transacciones'}), 500

    @jwt_required()
    def import_transactions(self):
        """Importa transacciones desde un archivo Excel, creando categorías si no existen"""
        user_id = get_jwt_identity()
        
        if 'file' not in request.files:
            return jsonify({'msg': 'No se proporcionó archivo'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'msg': 'Nombre de archivo vacío'}), 400
            
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            return jsonify({'msg': 'Formato de archivo no soportado. Use .xlsx o .xls'}), 400

        try:
            # Leer archivo Excel
            df = pd.read_excel(file)
            
            # Validar columnas requeridas
            required_columns = {'Fecha', 'Tipo Transacción', 'Cantidad'}
            if not required_columns.issubset(df.columns):
                missing = required_columns - set(df.columns)
                return jsonify({'msg': f'Faltan columnas requeridas: {missing}'}), 400

            # Procesar transacciones
            success_count = 0
            errors = []
            
            with self._session_scope():
                # Obtener categorías existentes del usuario
                user_categories = session.query(Category).filter_by(user_id=user_id).all()
                category_map = {cat.name.lower(): cat for cat in user_categories}
                
                for index, row in df.iterrows():
                    try:
                        # Validar y convertir datos
                        date = pd.to_datetime(row['Fecha']).date()
                        kind_str = str(row['Tipo Transacción']).strip().lower()
                        amount = float(row['Cantidad'])
                        description = str(row.get('Descripción', '')).strip() or None
                        category_name = str(row.get('Categoría', '')).strip() or None
                        category_color = str(row.get('Color Categoría', '')).strip() or None
                        category_type_str = str(row.get('Tipo Categoría', '')).strip() or None
                        
                        # Validar tipo de transacción
                        try:
                            kind = TransactionKind(kind_str)
                        except ValueError:
                            errors.append(f"Fila {index+2}: Tipo de transacción inválido '{kind_str}'")
                            continue
                        
                        # Mapear o crear categoría si existe
                        category_id = None
                        if category_name:
                            category_name_lower = category_name.lower()
                            
                            if category_name_lower in category_map:
                                # Usar categoría existente
                                category = category_map[category_name_lower]
                                category_id = category.id
                            else:
                                # Validar y crear nueva categoría
                                if not category_type_str:
                                    errors.append(f"Fila {index+2}: Falta el tipo de categoría para crear nueva categoría '{category_name}'")
                                    continue
                                
                                try:
                                    category_type = CategoryType(category_type_str)
                                except ValueError:
                                    errors.append(f"Fila {index+2}: Tipo de categoría inválido '{category_type_str}'")
                                    continue
                                
                                # Crear nueva categoría
                                new_category = Category(
                                    name=category_name,
                                    type=category_type,
                                    color=category_color or self._generate_random_color(),
                                    user_id=user_id
                                )
                                
                                session.add(new_category)
                                session.flush()  # Para obtener el ID
                                
                                category_id = new_category.id
                                category_map[category_name_lower] = new_category
                        
                        # Crear transacción
                        transaction = Transaction(
                            amount=amount,
                            description=description,
                            date=date,
                            kind=kind,
                            category_id=category_id,
                            user_id=user_id
                        )
                        
                        session.add(transaction)
                        success_count += 1
                        
                    except Exception as e:
                        errors.append(f"Fila {index+2}: Error - {str(e)}")
                        continue
                
                # Actualizar historiales si hubo transacciones nuevas
                if success_count > 0:
                    dates_to_update = {t.date for t in session.new if isinstance(t, Transaction)}
                    for date in dates_to_update:
                        HistoryController._update_month_history(user_id, date)
                        HistoryController._update_year_history(user_id, date)
                
                return jsonify({
                    'msg': f'Importación completada con {success_count} transacciones procesadas',
                    'success_count': success_count,
                    'error_count': len(errors),
                    'errors': errors if errors else None
                })

        except Exception as e:
            print(f"Error al importar transacciones: {e}")
            return jsonify({'msg': 'Error al procesar archivo Excel'}), 500

    def _generate_random_color(self):
        """Genera un color hexadecimal aleatorio para nuevas categorías"""
        return f"#{random.randint(0, 0xFFFFFF):06x}"