
# Documentación de la API de Gestión Financiera

## Endpoints de Autenticación

### POST /register

Registra un nuevo usuario.

**Parámetros de entrada:**

* `username` (string): Nombre de usuario
* `email` (string): Email del usuario
* `password` (string): Contraseña

**Respuesta exitosa (201):**

```json
{
  "msg": "Registro exitoso",
  "user": {
    "id": 1,
    "username": "usuario1",
    "email": "usuario@example.com"
  }
}
```

---

### POST /login

Inicia sesión para un usuario registrado.

**Parámetros de entrada:**

* `email` (string): Email del usuario
* `password` (string): Contraseña

**Respuesta exitosa (200):**

```json
{
  "msg": "Login exitoso",
  "user": {
    "id": 1,
    "username": "usuario1",
    "email": "usuario@example.com"
  }
}
```

---

### POST /logout

Cierra la sesión del usuario actual.

**Respuesta exitosa (200):**

```json
{
  "msg": "Sesión cerrada con éxito!"
}
```

---

### GET /profile

Obtiene la información del perfil del usuario autenticado.

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "username": "usuario1",
  "email": "usuario@example.com",
  "created_at": "2023-01-01T00:00:00"
}
```

---

### GET /check-auth

Verifica si el usuario está autenticado.

**Respuesta exitosa (200):**

```json
{
  "logged_in": true,
  "user_id": 1
}
```

---

## Endpoints de Transacciones

### GET /transactions

Obtiene todas las transacciones del usuario autenticado.

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "amount": 100.5,
    "description": "Compra supermercado",
    "date": "2023-01-15",
    "kind": "expense",
    "category": {
      "id": 3,
      "name": "Comida",
      "color": "#FF0000",
      "type": "expense",
      "created_at": "2023-01-01T00:00:00"
    },
    "created_at": "2023-01-15T10:30:00",
    "updated_at": "2023-01-15T10:30:00"
  }
]
```

---

### POST /transactions

Crea una nueva transacción.

**Parámetros de entrada:**

* `amount` (number): Cantidad
* `description` (string, opcional): Descripción
* `date` (string): Fecha (YYYY-MM-DD)
* `kind` (string): "income" o "expense"
* `category_id` (number, opcional)

**Respuesta exitosa (201):**

```json
{
  "msg": "Transacción creada",
  "transaction": {
    "id": 2,
    "amount": 100.5,
    "description": "Compra supermercado",
    "date": "2023-01-15",
    "kind": "expense",
    "category_id": 3
  }
}
```

---

### GET /transactions/[int:transaction_id](int:transaction_id)

Obtiene una transacción específica.

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "amount": 100.5,
  "description": "Compra supermercado",
  "date": "2023-01-15",
  "kind": "expense",
  "category_id": 3,
  "created_at": "2023-01-15T10:30:00",
  "updated_at": "2023-01-15T10:30:00"
}
```

---

### PUT /transactions/[int:transaction_id](int:transaction_id)

Actualiza una transacción existente.

**Parámetros de entrada (opcionales):**

* `amount`, `description`, `date`, `kind`, `category_id`

**Respuesta exitosa (200):**

```json
{
  "msg": "Transacción actualizada",
  "transaction": {
    "id": 1,
    "amount": 120.0,
    "description": "Compra supermercado",
    "date": "2023-01-15",
    "kind": "expense",
    "category_id": 3
  }
}
```

---

### DELETE /transactions/[int:transaction_id](int:transaction_id)

Elimina una transacción.

**Respuesta exitosa (200):**

```json
{
  "msg": "Transacción eliminada"
}
```

---

### GET /transactions/summary

Obtiene un resumen de transacciones para un período.

**Parámetros opcionales:**

* `start_date`, `end_date`

**Respuesta exitosa (200):**

```json
{
  "summary": {
    "income": 2000.0,
    "expenses": 1500.0,
    "balance": 500.0
  },
  "categories": {
    "income": [
      {
        "category": "Salario",
        "amount": 2000.0,
        "color": "#00FF00"
      }
    ],
    "expenses": [
      {
        "category": "Comida",
        "amount": 800.0,
        "color": "#FF0000"
      }
    ]
  }
}
```

---

### GET /transactions/export

Exporta todas las transacciones a un archivo Excel.

**Respuesta:** Archivo descargable con columnas: Fecha, Descripción, Categoría, Color Categoría, Tipo, Cantidad, Creado, Actualizado.

---

### POST /transactions/import

Importa transacciones desde un archivo Excel.

**Parámetros de entrada:**

* `file` (.xlsx o .xls)

**Formato requerido:**

* Mínimas: Fecha, Tipo, Cantidad
* Opcionales: Descripción, Categoría

**Respuesta exitosa (200):**

```json
{
  "msg": "Importación completada con 10 transacciones procesadas",
  "success_count": 10,
  "error_count": 2,
  "errors": [
    "Fila 5: Categoría 'Viajes' no encontrada",
    "Fila 8: Tipo de transacción inválido 'transfer'"
  ]
}
```

---

## Endpoints del Historial

### GET /history/monthly

Obtiene el historial mensual.

**Parámetros opcionales:**

* `year`, `month`

**Respuesta exitosa (200):**

```json
[
  {
    "day": 1,
    "month": 1,
    "year": 2023,
    "income": 1000.0,
    "expense": 500.0,
    "balance": 500.0
  }
]
```

---

### GET /history/yearly

Obtiene el historial anual.

**Parámetros opcionales:**

* `year`

**Respuesta exitosa (200):**

```json
[
  {
    "month": 1,
    "year": 2023,
    "income": 3000.0,
    "expense": 1500.0,
    "balance": 1500.0
  }
]
```

---

## Endpoints de Categorías

### GET /categories

Obtiene todas las categorías del usuario.

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "name": "Comida",
    "color": "#FF0000",
    "type": "expense",
    "created_at": "2023-01-01T00:00:00"
  }
]
```

---

### POST /categories

Crea una nueva categoría.

**Parámetros de entrada:**

* `name` (string)
* `color` (string - hex)
* `type` ("income" o "expense")

**Respuesta exitosa (201):**

```json
{
  "msg": "Categoría creada",
  "category": {
    "id": 2,
    "name": "Salario",
    "color": "#00FF00",
    "type": "income"
  }
}
```

---

### GET /categories/[int:category_id](int:category_id)

Obtiene una categoría específica.

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "name": "Comida",
  "color": "#FF0000",
  "type": "expense",
  "created_at": "2023-01-01T00:00:00"
}
```

---

### PUT /categories/[int:category_id](int:category_id)

Actualiza una categoría existente.

**Parámetros opcionales:**

* `name`, `color`, `type`

**Respuesta exitosa (200):**

```json
{
  "msg": "Categoría actualizada",
  "category": {
    "id": 1,
    "name": "Alimentación",
    "color": "#FF0000",
    "type": "expense"
  }
}
```

---

### DELETE /categories/[int:category_id](int:category_id)

Elimina una categoría.

**Respuesta exitosa (200):**

```json
{
  "msg": "Categoría eliminada"
}
```

---

## Endpoints de Ajustes

### GET /settings

Obtiene la configuración del usuario.

**Respuesta exitosa (200):**

```json
{
  "currency": "EUR"
}
```

---

### PUT /settings

Actualiza la configuración del usuario.

**Parámetros de entrada:**

* `currency` (string)
* `conversion_rate` (number, opcional)

**Respuesta exitosa (200):**

```json
{
  "msg": "Configuración y transacciones actualizadas",
  "settings": {
    "currency": "USD"
  }
}
```

---

### PUT /settings/profile

Actualiza el perfil del usuario.

**Parámetros de entrada:**

* `username` (string, opcional)
* `email` (string, opcional)

**Respuesta exitosa (200):**

```json
{
  "msg": "Perfil actualizado correctamente",
  "updated_fields": {
    "username": "nuevo_usuario"
  }
}
```

---

### PUT /settings/password

Actualiza la contraseña del usuario.

**Parámetros de entrada:**

* `current_password` (string)
* `new_password` (string)

**Respuesta exitosa (200):**

```json
{
  "msg": "Contraseña actualizada correctamente"
}
```
