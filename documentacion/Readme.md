# Encuentra tu Cargador
**Práctica Final - Informática II**
Autores: Gabriel Kaakedjian, Gabriel Peña

---

## Usuarios disponibles

La aplicación incluye los siguientes usuarios ya creados y listos para usar:

| Rol | Nombre de usuario | Contraseña |
|---|---|---|
| Administrador | Administrador | Administrador_12345 |
| Técnico | Tecnico1 | Tecnico1_12345 |
| Técnico | Tecnico2 | Tecnico2_54321 |
| Usuario | Usuario1 | Usuario1_12345 |
| Usuario | Usuario2 | Usuario2_54321 |
| Usuario | Usuario3 | Usuario3_13524 |
| Usuario | Usuario4 | Usuario4_24135 |

Cada rol da acceso a una parte diferente de la aplicación:
- El **administrador** accede al panel de gestión completo (usuarios, cargadores, reservas, favoritos, sesiones e incidencias).
- El **técnico** accede al panel de gestión de cargadores e incidencias.
- El **usuario** accede al mapa interactivo de cargadores para reservar, añadir favoritos y reportar incidencias.

---

## Requisitos previos

Antes de empezar, asegúrese de tener instalados los siguientes programas en su ordenador. Si ya los tiene instalados, puede saltarse este paso.

- **Node.js** (versión 18 o superior) - descárgalo desde: https://nodejs.org (elegir la versión LTS)
- **MySQL** - puede instalarlo de dos formas:
  - Con **XAMPP**: https://www.apachefriends.org
  - Con **MySQL Workbench**: https://dev.mysql.com/downloads/workbench

---

## ⚠️ Advertencia importante - Nombre de la base de datos

El script `BaseDeDatos.sql` crea una base de datos llamada `encuentraTuCargador`. Si ya existe una base de datos con ese nombre en su MySQL, **será eliminada y reemplazada** al importar el script. Haga una copia de seguridad si es necesario antes de continuar.

---

## Pasos para inicializar el proyecto

### Paso 1 - Extraer el archivo ZIP

Descomprima el archivo ZIP en una carpeta de su elección. Por ejemplo, en el Escritorio. Una vez descomprimido verá una carpeta llamada `GabrielKaakedjianGabrielPenaI2PracticaFinal`.

---

### Paso 2 - Crear el archivo de configuración

Dentro de la carpeta del proyecto, cree un archivo nuevo llamado exactamente `.env` (sin ninguna extensión adicional). Para crearlo:

1. Abra el bloc de notas o cualquier editor de texto.
2. Copie y pegue el siguiente contenido:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=aquí_su_contraseña_de_mysql
DB_NAME=encuentraTuCargador
JWT_SECRET=InformaticaII_GabrielKaakedjian_GabrielPena
JWT_EXPIRACION=8h
```

3. Sustituya `aquí_su_contraseña_de_mysql` por la contraseña de su MySQL. Si no tiene contraseña configurada, deje ese campo vacío: `DB_PASSWORD=`
4. Guarde el archivo con el nombre `.env` dentro de la carpeta del proyecto.

---

### Paso 3 - Instalar las dependencias del proyecto

1. Abra una terminal o símbolo del sistema en la carpeta del proyecto.
   - En Windows: haga clic derecho dentro de la carpeta y seleccione "Abrir en Terminal" o "Abrir ventana de comandos aquí".
2. Escriba el siguiente comando y pulse Enter:

```
npm install
```

3. Espere a que termine. Verá que se crea automáticamente una carpeta llamada `node_modules`. Esto es normal y significa que todo ha ido bien.

---

### Paso 4 - Importar la base de datos

Este paso crea la base de datos con todas las tablas y los usuarios iniciales. Elija una de las dos opciones según el programa que tenga instalado.

#### Opción A - Con XAMPP

1. Abra el panel de control de XAMPP y pulse **Start** en MySQL.
2. Abra su navegador y vaya a: `http://localhost/phpmyadmin`
3. En la barra superior haga clic en **Importar**.
4. Pulse **Seleccionar archivo** y busque el archivo `BaseDeDatos.sql` dentro de la carpeta `baseDeDatos` del proyecto.
5. Pulse **Continuar** y espere a que finalice la importación.
6. En el panel izquierdo debería aparecer la base de datos `encuentraTuCargador` con todas sus tablas.

#### Opción B - Con MySQL Workbench

1. Abra MySQL Workbench y haga doble clic en su conexión de MySQL para conectarse.
2. En el menú superior vaya a **File → Open SQL Script**.
3. Busque y seleccione el archivo `BaseDeDatos.sql` dentro de la carpeta `baseDeDatos` del proyecto.
4. Pulse el botón del rayo ⚡ en la barra de herramientas para ejecutar el script.
5. En el panel izquierdo, haga clic derecho y seleccione **Refresh All**. Debería aparecer la base de datos `encuentraTuCargador`.

---

### Paso 5 - Arrancar el servidor

1. En la terminal que abrió en el Paso 3, escriba el siguiente comando y pulse Enter:

```
npm start
```

2. Si todo está correcto, verá estos mensajes en la terminal:

```
Servidor WebSocket iniciado.
Servidor en ejecución en http://localhost:3000
Conexión a MySQL establecida correctamente.
```

Si no aparece alguno de estos mensajes, compruebe que MySQL está en ejecución y que el archivo `.env` está correctamente configurado.

---

### Paso 6 - Abrir la aplicación

1. Abra su navegador (Chrome, Firefox, Edge o Safari).
2. Escriba la siguiente dirección y pulse Enter:

```
http://localhost:3000
```

3. Verá la pantalla de inicio de sesión. Utilice cualquiera de los usuarios de la tabla del principio de este documento para acceder.

---

## Para detener el servidor

Cuando quiera cerrar la aplicación, vuelva a la terminal y pulse:

```
Ctrl + C
```

---

## Funcionalidades principales

### Rol usuario
- Visualización de cargadores en un mapa interactivo con marcadores de colores según estado (libre, ocupado, en reparación).
- Filtrado de cargadores por tipo (carga rápida, estándar, lenta) y estado.
- Panel lateral con detalles del cargador: estado, tipo, nivel de carga, coste, tiempo estimado y dirección.
- Reserva de cargadores con tiempo límite de 30 minutos.
- Posibilidad de completar o cancelar una reserva activa desde el perfil.
- Historial de reservas y favoritos en la página de perfil con filtros y paginación.
- Gestión de favoritos: añadir y eliminar cargadores favoritos.
- Reporte de incidencias sobre cargadores defectuosos.
- Apertura de la ubicación del cargador en Google Maps.
- Geolocalización automática para centrar el mapa en la posición del usuario.
- Actualización en tiempo real del estado de los cargadores en el mapa mediante WebSockets.
- Cancelación automática de la reserva al expirar los 30 minutos mediante un job programado con node-cron, liberando el cargador automáticamente.

### Rol técnico
- Panel con estadísticas en tiempo real: cargadores libres, ocupados, en reparación e incidencias pendientes.
- Tabla de cargadores con posibilidad de actualizar su estado.
- Gestión de incidencias: visualización y marcado como leídas.
- Actualización automática de tablas y estadísticas mediante WebSockets al producirse cambios en cargadores e incidencias.
- Cancelación automática de reservas expiradas cada minuto mediante un job programado con node-cron, liberando el cargador automáticamente.

### Rol administrador
- Panel con estadísticas en tiempo real: incidencias pendientes, cargadores libres, ocupados y en reparación.
- Gestión completa de usuarios: crear, editar y eliminar.
- Gestión completa de cargadores: crear, editar y eliminar.
- Visualización de todas las reservas, favoritos, sesiones e incidencias.
- Actualización automática de tablas y estadísticas mediante WebSockets al producirse cambios en cargadores, reservas e incidencias.
- Cancelación automática de reservas expiradas cada minuto mediante un job programado con node-cron, liberando el cargador automáticamente.
- Historial de inicios de sesión con IP y dispositivo.

---

## Tecnologías utilizadas

### Frontend
- **HTML5, CSS3 y JavaScript (ES6+)** - estructura, estilos y lógica de cada página.
- **Bootstrap 5** - componentes de interfaz y diseño responsive.
- **Leaflet.js** - librería de mapas interactivos sobre teselas de OpenStreetMap.
- **WebSockets (API nativa del navegador)** - conexión persistente con el servidor para recibir en tiempo real: cambios de estado de los marcadores del mapa, actualizaciones del contador de incidencias pendientes y cambios en las tablas del panel de administrador y técnico.

### Backend
- **Node.js** - entorno de ejecución del servidor.
- **Express** - framework para la construcción de la API REST.
- **jsonwebtoken** - generación y verificación de tokens JWT para la autenticación.
- **bcrypt** - cifrado irreversible de contraseñas con 10 salt rounds.
- **ws** - librería WebSocket del servidor para enviar notificaciones en tiempo real a los clientes conectados según su rol.
- **node-cron** - planificador de tareas que cancela automáticamente las reservas expiradas cada minuto y libera el cargador correspondiente.
- **dotenv** - carga de variables de entorno desde el archivo `.env`.
- **mysql2** - cliente MySQL para la comunicación con la base de datos mediante pool de conexiones.

### Base de datos
- **MySQL** - sistema de gestión de base de datos relacional con 7 tablas: `roles`, `usuarios`, `cargadores`, `reservas`, `favoritos`, `sesiones` y `notificaciones`.

### APIs externas
- **OpenStreetMap** - proveedor de teselas del mapa (gratuito y sin necesidad de API key).
- **Google Maps** - apertura de la ruta de navegación hasta el cargador seleccionado.

---

© 2026 Encuentra tu Cargador - Gabriel Kaakedjian, Gabriel Peña