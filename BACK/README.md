## Documentación de la API Trirule

### Ruta Base
- `GET /`
  - **Descripción**: Devuelve un mensaje JSON indicando que la API está funcionando.
  - **Respuesta**: `{ "msg": "API Trirule funcionando" }`

### Autenticación
- `POST /login`
  - **Descripción**: Autentica a un usuario y devuelve un token JWT en una cookie.
  - **Cuerpo de la solicitud**: JSON con `email` y `password`.
  - **Respuesta**: Mensaje de éxito o error.

- `POST /logout`
  - **Descripción**: Cierra la sesión del usuario eliminando la cookie de autenticación.
  - **Respuesta**: Mensaje de éxito.

- `GET /profile`
  - **Descripción**: Devuelve información del usuario autenticado.
  - **Respuesta**: JSON con los datos del usuario.

- `GET /check-auth`
  - **Descripción**: Verifica si el usuario está autenticado.
  - **Respuesta**: Mensaje de éxito o no autorizado.

### Configuración del Usuario
- `GET /settings`
  - **Descripción**: Obtiene la configuración del usuario (por ejemplo, la moneda).
  - **Respuesta**: JSON con la configuración.

- `PUT /settings`
  - **Descripción**: Actualiza la configuración del usuario.
  - **Cuerpo de la solicitud**: JSON con los nuevos valores de configuración.
  - **Respuesta**: Configuración actualizada o mensaje de error.

### Categorías
- `GET /categories`
  - **Descripción**: Recupera todas las categorías del usuario actual.
  - **Respuesta**: Lista de categorías.

- `POST /categories`
  - **Descripción**: Crea una nueva categoría.
  - **Cuerpo de la solicitud**: JSON con `name`, `type` y `icon` (opcional).
  - **Respuesta**: Categoría creada o mensaje de error.

- `GET /categories/<int:category_id>`
  - **Descripción**: Obtiene los detalles de una categoría específica.
  - **Respuesta**: JSON con los datos de la categoría.

- `PUT /categories/<int:category_id>`
  - **Descripción**: Actualiza una categoría.
  - **Cuerpo de la solicitud**: JSON con los campos a modificar.
  - **Respuesta**: Categoría actualizada o mensaje de error.

- `DELETE /categories/<int:category_id>`
  - **Descripción**: Elimina una categoría.
  - **Respuesta**: Mensaje de éxito o de error.

### Transacciones
- `GET /transactions`
  - **Descripción**: Recupera todas las transacciones del usuario actual.
  - **Respuesta**: Lista de transacciones.

- `POST /transactions`
  - **Descripción**: Crea una nueva transacción.
  - **Cuerpo de la solicitud**: JSON con los detalles de la transacción.
  - **Respuesta**: Transacción creada o mensaje de error.

- `GET /transactions/<int:transaction_id>`
  - **Descripción**: Recupera los detalles de una transacción específica.
  - **Respuesta**: JSON con los datos de la transacción.

- `PUT /transactions/<int:transaction_id>`
  - **Descripción**: Actualiza una transacción existente.
  - **Cuerpo de la solicitud**: JSON con los campos a modificar.
  - **Respuesta**: Transacción actualizada o mensaje de error.

- `DELETE /transactions/<int:transaction_id>`
  - **Descripción**: Elimina una transacción.
  - **Respuesta**: Mensaje de éxito o error.

- `GET /transactions/summary`
  - **Descripción**: Devuelve un resumen de las transacciones (por ejemplo, totales).
  - **Respuesta**: JSON con los datos resumidos.

### Historial
- `GET /history/monthly`
  - **Descripción**: Recupera el historial mensual de ingresos y gastos del usuario.
  - **Respuesta**: Lista con los datos del historial mensual.

- `GET /history/yearly`
  - **Descripción**: Recupera el historial anual de ingresos y gastos del usuario.
  - **Respuesta**: Lista con los datos del historial anual.

