from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, Date, Float,
    UniqueConstraint, Enum, create_engine
)
from sqlalchemy.orm import relationship, declarative_base, sessionmaker, scoped_session
import enum
from datetime import datetime

engine = create_engine('mysql+pymysql://root:@localhost/trirule',
        pool_pre_ping=True,  # Verifica conexiones antes de usarlas
        pool_recycle=3600,   # Recicla conexiones cada 1 hora
        echo=False
    )

Base = declarative_base()
SessionFactory = sessionmaker(bind=engine)
session = scoped_session(SessionFactory)

# Enum para el tipo de categoría
class CategoryType(enum.Enum):
    need = "need"
    want = "want"
    save = "save"

# Enum para tipo de transacción
class TransactionKind(enum.Enum):
    income = "income"
    expense = "expense"
    transfer = "transfer"

# -------------------- USER --------------------
class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False)
    email = Column(String(120), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now())

    settings = relationship("UserSettings", back_populates="user", uselist=False)
    categories = relationship("Category", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    month_history = relationship("MonthHistory", back_populates="user")
    year_history = relationship("YearHistory", back_populates="user")

# -------------------- USER SETTINGS --------------------
class UserSettings(Base):
    __tablename__ = 'user_settings'

    user_id = Column(Integer, ForeignKey('user.id'), primary_key=True)
    currency = Column(String(10), default="EUR")

    user = relationship("User", back_populates="settings")

# -------------------- CATEGORY --------------------
class Category(Base):
    __tablename__ = 'category'
    __table_args__ = (UniqueConstraint('name', 'type', 'user_id'),)

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.now())
    name = Column(String(50), nullable=False)
    icon = Column(String(50), nullable=True)
    type = Column(Enum(CategoryType), nullable=False)

    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", back_populates="categories")

    transactions = relationship("Transaction", back_populates="category")

# -------------------- TRANSACTION --------------------
class Transaction(Base):
    __tablename__ = 'transaction'

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)

    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    user = relationship("User", back_populates="transactions")

    kind = Column(Enum(TransactionKind), nullable=False)

    category_id = Column(Integer, ForeignKey('category.id'))
    category = relationship("Category", back_populates="transactions")

# -------------------- MONTH HISTORY --------------------
class MonthHistory(Base):
    __tablename__ = 'month_history'
    __table_args__ = (UniqueConstraint('user_id', 'day', 'month', 'year'),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    day = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    income = Column(Float, default=0)
    expense = Column(Float, default=0)

    user = relationship("User", back_populates="month_history")

# -------------------- YEAR HISTORY --------------------
class YearHistory(Base):
    __tablename__ = 'year_history'
    __table_args__ = (UniqueConstraint('user_id', 'month', 'year'),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    month = Column(Integer, nullable=False) 
    year = Column(Integer, nullable=False)
    income = Column(Float, default=0)
    expense = Column(Float, default=0)

    user = relationship("User", back_populates="year_history")

