
## Documentación de la API Trirule

  

### Ruta Base

-  `GET /`

-  **Descripción**: Devuelve un mensaje JSON indicando que la API está funcionando.

-  **Respuestas**:
	```json
	{
		"msg":  "API Trirule funcionando"
	}
	```

### Autenticación

-  `POST /register`

-  **Descripción**: Registra al usuario en la base de datos.

-  **Cuerpo de la solicitud**: JSON con `username`, `email` y `password`.

-  **Respuesta**: 
	```json
	{
		"msg": "Registro exitoso",
		"user": {
			"id": 1,
			"username": "testuser",
			"email": "test@example.com"
		}
	}
	```

-  `POST /login`

-  **Descripción**: Autentica a un usuario y devuelve un token JWT en una cookie.

-  **Cuerpo de la solicitud**: JSON con `email` y `password`.

-  **Respuesta**: 
	```json
	{
		"msg": "Login exitoso",
		"user": {
		  "email": "test@example.com",
		  "id": 1,
		  "username": "testuser"
		}
	}
	```
	
-  `POST /logout`

-  **Descripción**: Cierra la sesión del usuario eliminando la cookie de autenticación.

-  **Respuesta**:
	```json
	{
	 "msg": "Logout exitoso"
	}
	```
	
-  `GET /profile`

-  **Descripción**: Devuelve información del usuario autenticado.

-  **Respuesta**:
	```json
	{
	 "created_at": "2025-04-07T17:32:33",
	 "email": "test@example.com",
	 "id": 1,
	 "username": "testuser"
	}
	``` 

-  `GET /check-auth`

-  **Descripción**: Verifica si el usuario está autenticado.

-  **Respuesta**:
	```json
	{
	 "logged_in": true,
	 "user_id": "1"
	}
	```
	```json
	{
	 "logged_in": false
	}
	```
-  `POST /check-email`

-  **Descripción**: Verifica si un correo electrónico ya está registrado.

-  **Cuerpo de la solicitud**: JSON con el campo `email`.

-  **Respuesta**: 
	```json
	{"exists": true}
	```
	```json
	{"exists": false}
	```
	
-  `POST /check-username`

-  **Descripción**: Verifica si un nombre de usuario ya está registrado.

-  **Cuerpo de la solicitud**: JSON con el campo `username`.

-  **Respuesta**:
	```json
	{"exists": true}
	```
	```json
	{"exists": false}
	```
	
### Configuración del Usuario

-  `GET /settings`

-  **Descripción**: Obtiene la configuración del usuario (por ejemplo, la moneda).

-  **Respuesta**:
	```json
	{"currency": "EUR"}
	```
-  `PUT /settings`

-  **Descripción**: Actualiza la configuración del usuario.

-  **Cuerpo de la solicitud**: JSON con los nuevos valores de configuración.

-  **Respuesta**: 
	```json
	{
	  "msg": "Configuración actualizada",
	  "settings": {
	    "currency": "EUR"
	  }
	}
	```
	
### Categorías

-  `GET /categories`

-  **Descripción**: Recupera todas las categorías del usuario actual.

-  **Respuesta**:
	```json
	[
	  {
	    "created_at": "2025-04-08T18:04:17",
	    "icon": "iconoComida",
	    "id": 1,
	    "name": "COMIDA",
	    "type": "need"
	  }
	]
	```
	
-  `POST /categories`

-  **Descripción**: Crea una nueva categoría.

-  **Cuerpo de la solicitud**: JSON con `name`, `type` y `icon` (opcional).

-  **Respuesta**:
	```json
	{
	  "category": {
	    "icon": "iconoComida",
	    "id": 1,
	    "name": "COMIDA",
	    "type": "need"
	  },
	  "msg": "Categoría creada"
	}
	```
-  `GET /categories/<int:category_id>`

-  **Descripción**: Obtiene los detalles de una categoría específica.

-  **Respuesta**:
	```json
	{
	  "created_at": "2025-04-08T18:04:17",
	  "icon": "iconoComida",
	  "id": 1,
	  "name": "COMIDA",
	  "type": "need"
	}
	```
-  `PUT /categories/<int:category_id>`

-  **Descripción**: Actualiza una categoría.

-  **Cuerpo de la solicitud**: JSON con los campos a modificar.

-  **Respuesta**:
	```json
	{
	  "category": {
	    "icon": "iconoComida2",
	    "id": 1,
	    "name": "COMIDA2",
	    "type": "need"
	  },
	  "msg": "Categoría actualizada"
	}
	```
-  `DELETE /categories/<int:category_id>`

-  **Descripción**: Elimina una categoría.

-  **Respuesta**: Mensaje de éxito o de error.
	```json
	{
	  "msg": "Categoría eliminada"
	}
	```

### Transacciones

-  `GET /transactions`

-  **Descripción**: Recupera todas las transacciones del usuario actual.

-  **Respuesta**:

	```json
	[
		{
		  "amount": 100,
		  "category_id": null,
		  "created_at": "2025-04-08T18:04:17",
		  "date": "2025-04-08",
		  "description": "Compra supermercado",
		  "id": 1,
		  "kind": "expense",
		  "updated_at": "2025-04-08T18:04:17"
		}
	]
	```

-  `POST /transactions`

-  **Descripción**: Crea una nueva transacción.

-  **Cuerpo de la solicitud**: JSON con los detalles de la transacción.

-  **Respuesta**:
	```json
	{
	  "msg": "Transacción creada",
	  "transaction": {
	    "amount": 100,
	    "category_id": null,
	    "date": "2025-04-08",
	    "description": "Compra supermercado",
	    "id": 1,
	    "kind": "expense"
	  }
	}
	```


-  `GET /transactions/<int:transaction_id>`

-  **Descripción**: Recupera los detalles de una transacción específica.

-  **Respuesta**:
	```json
	{
	  "amount": 100,
	  "category_id": null,
	  "created_at": "2025-04-08T18:04:17",
	  "date": "2025-04-08",
	  "description": "Compra supermercado",
	  "id": 1,
	  "kind": "expense",
	  "updated_at": "2025-04-08T18:04:17"
	}
	```
	
-  `PUT /transactions/<int:transaction_id>`

-  **Descripción**: Actualiza una transacción existente.

-  **Cuerpo de la solicitud**: JSON con los campos a modificar.

-  **Respuesta**: 
	```json
	{
	  "msg": "Transacción actualizada",
	  "transaction": {
	    "amount": 200,
	    "category_id": null,
	    "date": "2025-04-08",
	    "description": "Compra supermercado2",
	    "id": 1,
	    "kind": "expense"
	  }
	}
	``` 
  

-  `DELETE /transactions/<int:transaction_id>`

-  **Descripción**: Elimina una transacción.

-  **Respuesta**:
	```json
	{"msg": "Transacción eliminada"}
	```
  

-  `GET /transactions/summary`

-  **Descripción**: Devuelve un resumen de las transacciones (por ejemplo, totales).

-  **Respuesta**: JSON con los datos resumidos.
	```json
	{
	  "balance": 0,
	  "categories": {},
	  "expenses": 0,
	  "income": 0,
	  "month": 4,
	  "year": 2025
	}
	```
### Historial

-  `GET /history/monthly`

-  **Descripción**: Recupera el historial mensual de ingresos y gastos del usuario.

-  **Respuesta**:
	```json
	[
	  {
	    "balance": -100,
	    "expense": 100,
	    "income": 0,
	    "month": 4,
	    "year": 2025
	  }
	]
	```

-  `GET /history/yearly`

-  **Descripción**: Recupera el historial anual de ingresos y gastos del usuario.

-  **Respuesta**: Lista con los datos del historial anual.
	```json
	[
	  {
	    "balance": -100,
	    "expense": 100,
	    "income": 0,
	    "year": 2025
	  }
	]
	```