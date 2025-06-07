import pandas as pd
import random
from datetime import datetime, timedelta


"""Esto es un script para generar un excel con transacciones aleatorias"""


# Configuraciones
start_date = datetime.today() - timedelta(days=730)  # 2 años atrás
end_date = datetime.today()

# Categorías simuladas
categorias = [
    {"nombre": "Salario", "color": "#4dff00", "tipo": "save", "tipo_trans": "income"},
    {"nombre": "Supermercado", "color": "#ff0000", "tipo": "need", "tipo_trans": "expense"},
    {"nombre": "Ocio", "color": "#0000ff", "tipo": "want", "tipo_trans": "expense"},
    {"nombre": "Transporte", "color": "#ffa500", "tipo": "need", "tipo_trans": "expense"},
    {"nombre": "Inversión", "color": "#008000", "tipo": "save", "tipo_trans": "expense"},
    {"nombre": "Freelance", "color": "#00cccc", "tipo": "save", "tipo_trans": "income"}
]

# Función para generar una transacción aleatoria
def generar_transaccion(fecha):
    cat = random.choice(categorias)
    cantidad = round(random.uniform(5, 1000), 2)  # Simula montos razonables
    descripcion = random.choice(["Pago", "Compra", "Ingreso", "Transferencia", "Suscripción"])
    creado = actualizado = fecha.strftime("%Y-%m-%d %H:%M")
    return {
        "Fecha": fecha.date(),
        "Descripción": descripcion,
        "Categoría": cat["nombre"],
        "Color Categoría": cat["color"],
        "Tipo Categoría": cat["tipo"],
        "Tipo Transacción": cat["tipo_trans"],
        "Cantidad": cantidad,
        "Creado": creado,
        "Actualizado": actualizado
    }

# Generar lista de transacciones por día
datos = []
fecha_actual = start_date
while fecha_actual <= end_date:
    num_transacciones = random.randint(1, 3)  # 1 a 3 transacciones por día
    for _ in range(num_transacciones):
        datos.append(generar_transaccion(fecha_actual))
    fecha_actual += timedelta(days=1)

# Crear DataFrame y exportar a Excel
df = pd.DataFrame(datos)
df.to_excel("transacciones_2_anios.xlsx", index=False)

print("Archivo generado: transacciones_2_anios.xlsx")
