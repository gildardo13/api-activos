Este es el backend de la plataforma **Control Activos**, desarrollado con **NestJS**, **Prisma ORM** y **PostgreSQL**. Este servicio expone una API REST para la gestión de activos, asignaciones, flujos de aprobación y geocercas, e incluye un servidor TCP nativo para recibir, decodificar y procesar la telemetría en tiempo real de dispositivos físicos GPS Teltonika (FMC920).

---

## 📋 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu entorno local:

* **Node.js** (Versión 18 o superior recomendada)
* **pnpm** (Gestor de paquetes recomendado para este proyecto)
* **PostgreSQL** (Como base de datos relacional)

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo:

### 1. Clonar el proyecto e instalar dependencias
Instala todas las dependencias del proyecto usando `pnpm`:

```bash
pnpm install
```

### 3. Generar el cliente de Prisma ORM
Antes de ejecutar el proyecto, debes generar el cliente de Prisma para que coincida con tu esquema de base de datos actual:

```bash
pnpm prisma generate
```

---


### Ejecutar en Desarrollo
Para levantar el servidor en modo desarrollo con recarga automática (hot reload) ante cambios de código:

```bash
pnpm run start:dev
```

### Compilar para Producción (Build)
Para compilar el código TypeScript a JavaScript de producción (los archivos resultantes se guardarán en la carpeta `/dist`):

```bash
pnpm run build
```

### Ejecutar en Producción
Una vez compilado el proyecto, puedes iniciar la aplicación optimizada para producción:

```bash
pnpm run start:prod
```
---

## Servidor GPS (TCP)

El servicio inicia automáticamente un servidor TCP en segundo plano (configurado en `tcp-server.service.ts`) al levantar la aplicación.
* **Puerto predeterminado:** `2102` (configurable mediante `GPS_TCP_PORT` en el `.env`).
* **Protocolos soportados:** Tramas binarias Teltonika (Codec 8 y Codec 8 Extended).
* **Seguridad:** El servidor valida el IMEI del dispositivo contra la base de datos durante el saludo (*handshake*). Si el IMEI no está registrado, corta la conexión TCP inmediatamente para ahorrar recursos y evitar accesos no autorizados.

---
## Variables de Entorno (.env)
### 1. Conexiones a Bases de Datos (PostgreSQL)
* `DATABASE_URL`: Cadena de conexión principal de PostgreSQL utilizada por Prisma para almacenar la información de los activos y telemetría.
* `DATABASE_URL_AUTH`: Cadena de conexión de PostgreSQL para el módulo común de autenticación y accesos.
* `PORT_DB`: Puerto de escucha de la base de datos.
* `PASS_DB_AWS`: Contraseña de acceso a la base de datos PostgreSQL alojada en AWS RDS, utilizada para construir dinámicamente las cadenas de conexión multitenant para cada empresa en producción.

### 2. Autenticación y Seguridad
* `JWT_SECRET`: Llave secreta utilizada para firmar y verificar tokens de autenticación de usuarios.
* `CLIENT_ID` / `CLIENT_SECRET`: Credenciales de cliente (ID y Secret) utilizadas para la autenticación y autorización en el consumo de APIs y servicios internos de la plataforma.
* `TURNSTILE_SECRET_KEY`: Llave secreta de Cloudflare Turnstile utilizada para la validación y verificación de CAPTCHAs en el backend.

### 3. Servidor de Correos (SMTP)
* `MAIL_HOST`: Servidor SMTP de correo (ej. `smtp.gmail.com`).
* `MAIL_PORT`: Puerto SMTP (normalmente `587` para cifrado TLS).
* `MAIL_USER`: Cuenta de correo emisora de alertas e invitaciones.
* `MAIL_PASS`: Contraseña de aplicación o contraseña del correo emisor.

### 4. Configuración del Servidor y Entorno
* `CONTROL_ACTIVOS_ENV` / `CONTROL_ACTIVOS_ENV`: Indica el entorno de ejecución (`dev` / `test` / `prod`).

### 5. Servicios de Almacenamiento (Cloudinary)
* `CLOUDINARY_CLOUD_NAME`: Nombre del espacio en la nube en Cloudinary.
* `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: Credenciales de acceso de la API de Cloudinary para subida de fotos de activos y documentos.

### 6. Integración con otros Microservicios
* `AUTH_BACK` / `CONTROL_ACTIVOS_AUTH_BACK_...`: Dirección de la API del backend de Autenticación.
* `RH_BACK_...`: Dirección de la API del backend de Recursos Humanos.
* `ROOT_BACK_...`: Dirección de la API del backend Root.
* `WORKFLOW_BACK_...`: Dirección de la API del sistema de Flujos de Trabajo (workflows).
* `NEXT_PUBLIC_IA_SERVICES_JIBBY_...`: Dirección de la API del servicio de Inteligencia Artificial para análisis de documentos de activos.

### 7. Keys y Acciones de Módulos (Permisos y API)
* `MODULE_ID`: Identificador único UUID del módulo de control de activos.
* `MODULE_ACTION_ASSIGNMENT_ID`: Identificador de la acción de asignación de activos.
* `MODULE_ACTION_UPDATE_ID`: Identificador de la acción de actualización del activo.
* `MODULE_ACTION_CHANGES_ID`: Identificador de la acción para historial de cambios de activos.
* `MODULE_ACTION_RETURN_ID`: Identificador de la acción de devolución de activos.
* `EXTERNAL_API_TIMEOUT`: Tiempo límite de espera (timeout) en milisegundos para solicitudes a APIs externas (generalmente `10000` ms).
* `DEFAULT_ORGANIZATION_ID`: Identificador UUID de la organización por defecto en el sistema.


### 8. Configuracion del puerto del modelo TMC920
* `GPS_TCP_PORT`: Puerto en el que escucha el servidor TCP de GPS.
