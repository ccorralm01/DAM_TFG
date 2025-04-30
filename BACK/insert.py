from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, UserSettings, Category, Transaction, MonthHistory, YearHistory
from datetime import datetime, date, timedelta
import random
import bcrypt
from collections import defaultdict
from sqlalchemy import select

# Configuración de la base de datos
engine = create_engine('mysql+pymysql://root:@localhost/trirule', echo=False)
Session = sessionmaker(bind=engine)
session = Session()

def generar_fecha_aleatoria(año=None, mes=None):
    """Genera una fecha aleatoria, opcionalmente para un año/mes específico"""
    hoy = datetime.now()
    año = año or hoy.year
    mes = mes or random.randint(1, 12)
    
    # Determinar el rango de fechas válido
    primer_dia = date(año, mes, 1)
    
    if mes == 12:
        ultimo_dia = date(año+1, 1, 1) - timedelta(days=1)
    else:
        ultimo_dia = date(año, mes+1, 1) - timedelta(days=1)
    
    # Asegurarnos de no generar fechas futuras
    if ultimo_dia > hoy.date():
        ultimo_dia = hoy.date()
    
    delta = ultimo_dia - primer_dia
    dias_aleatorios = random.randint(0, delta.days)
    return primer_dia + timedelta(days=dias_aleatorios)

def create_test_data_with_random_dates():
    try:
        # 1. Crear usuario (si no existe)
        user = session.get(User, 1)  # Usando el nuevo método Session.get()
        password = "cesar2001@"
        if not user:
            user = User(
                id=1,
                username="César",
                email="ceencome01@gmail.com",
                password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()),
                created_at=datetime.now()
            )
            session.add(user)
            session.flush()  # Forzar el flush para obtener el ID
        
        # 2. Configuración del usuario
        settings = session.get(UserSettings, 1)  # Usando el nuevo método Session.get()
        if not settings:
            settings = UserSettings(
                user_id=1,
                currency="USD"
            )
            session.add(settings)
        
        def random_color():
            return "#{:06x}".format(random.randint(0, 0xFFFFFF))
        
        # 3. Crear categorías (solo si no existen)
        if not session.execute(select(Category).where(Category.user_id == 1)).first():
            categories = [
                # Necesidades
                Category(name="Comida", color=random_color(), type="need", user_id=1),
                Category(name="Casa", color=random_color(), type="need", user_id=1),
                Category(name="Transporte", color=random_color(), type="need", user_id=1),
                Category(name="Salud", color=random_color(), type="need", user_id=1),
                # Deseos
                Category(name="Diversión", color=random_color(), type="want", user_id=1),
                Category(name="Comer fuera", color=random_color(), type="want", user_id=1),
                Category(name="Vacaciones", color=random_color(), type="want", user_id=1),
                Category(name="Moda", color=random_color(), type="want", user_id=1),
                # Ahorros
                Category(name="Ahorros", color=random_color(), type="save", user_id=1),
                Category(name="Inversiones", color=random_color(), type="save", user_id=1),
                Category(name="Emergencias", color=random_color(), type="save", user_id=1)
            ]
            session.add_all(categories)
            session.flush()
        
        # 4. Crear transacciones con fechas aleatorias
        if not session.execute(select(Transaction).where(Transaction.user_id == 1)).first():
            # Generamos transacciones para los últimos 12 meses
            current_year = datetime.now().year
            current_month = datetime.now().month
            
            transactions = []
            for month_offset in range(0, 12):  # Últimos 12 meses
                year = current_year
                month = current_month - month_offset
                if month <= 0:
                    month += 12
                    year -= 1
                
                # Ingresos (1-2 por mes)
                for _ in range(random.randint(1, 2)):
                    transactions.append(Transaction(
                        amount=round(random.uniform(1000, 3000), 2),
                        description="Salario" if random.random() > 0.3 else "Ingreso extra",
                        date=generar_fecha_aleatoria(year, month),
                        user_id=1,
                        kind="income",
                        category_id=None
                    ))
                
                # Gastos (8-15 por mes)
                for _ in range(random.randint(8, 15)):
                    category_type = random.choices(
                        ['need', 'want', 'save'],
                        weights=[0.5, 0.3, 0.2]
                    )[0]
                    category = random.choice([
                        cat.id for cat in session.execute(
                            select(Category).where(
                                (Category.user_id == 1) & 
                                (Category.type == category_type)
                            )
                        ).scalars().all()
                    ])
                    
                    amount = round(random.uniform(5, 200), 2) if category_type != 'need' else round(random.uniform(20, 500), 2)
                    
                    transactions.append(Transaction(
                        amount=amount,
                        description=f"Gasto en {category_type}",
                        date=generar_fecha_aleatoria(year, month),
                        user_id=1,
                        kind="expense",
                        category_id=category
                    ))
            
            session.add_all(transactions)
            session.flush()
        
        # 5. Generar historial mensual basado en transacciones reales
        if not session.execute(select(MonthHistory).where(MonthHistory.user_id == 1)).first():
            # Agrupar transacciones por mes y día
            daily_data = defaultdict(lambda: {'income': 0, 'expense': 0})
            
            for trans in session.execute(
                select(Transaction).where(Transaction.user_id == 1)
            ).scalars().all():
                key = (trans.date.year, trans.date.month, trans.date.day)
                if trans.kind == "income":
                    daily_data[key]['income'] += trans.amount
                else:
                    daily_data[key]['expense'] += trans.amount
            
            # Crear registros de historial
            month_history = []
            for (year, month, day), amounts in daily_data.items():
                month_history.append(MonthHistory(
                    user_id=1,
                    year=year,
                    month=month,
                    day=day,  # Añadiendo el día que faltaba
                    income=round(amounts['income'], 2),
                    expense=round(amounts['expense'], 2)
                ))
            
            session.add_all(month_history)
            session.flush()
        
        # 6. Generar historial anual basado en transacciones reales
        if not session.execute(select(YearHistory).where(YearHistory.user_id == 1)).first():
            # Agrupar transacciones por año y mes
            yearly_data = defaultdict(lambda: {'income': 0, 'expense': 0})
            
            for trans in session.execute(
                select(Transaction).where(Transaction.user_id == 1)
            ).scalars().all():
                key = (trans.date.year, trans.date.month)
                if trans.kind == "income":
                    yearly_data[key]['income'] += trans.amount
                else:
                    yearly_data[key]['expense'] += trans.amount
            
            # Crear registros de historial
            year_history = []
            for (year, month), amounts in yearly_data.items():
                year_history.append(YearHistory(
                    user_id=1,
                    year=year,
                    month=month,  # Añadiendo el mes que faltaba
                    income=round(amounts['income'], 2),
                    expense=round(amounts['expense'], 2)
                ))
            
            session.add_all(year_history)
        
        session.commit()
        print("✅ Datos de prueba con fechas aleatorias creados exitosamente")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error al crear datos: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    
    response = input("¿Crear datos de prueba con fechas aleatorias? (s/n): ").lower()
    if response == 's':
        create_test_data_with_random_dates()
    else:
        print("Operación cancelada")