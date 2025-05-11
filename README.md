Microservicio de Autenticación (ms-auth)
# Microservicio de Autenticación (ms-auth)

Este es un servicio independiente diseñado para la gestión de identidad y el control de acceso. Implementado con **NestJS (un framework de TypeScript para construir aplicaciones de servidor eficientes y escalables)** y siguiendo la **arquitectura hexagonal (puertos y adaptadores)**...

Autenticación de usuarios mediante JWT (JSON Web Tokens).
Sistema de roles predefinidos: user, admin, super-admin.
Gestión de permisos granulares para un control de acceso detallado.
Protección de endpoints basada en la asignación de roles.


Arquitectura
Este proyecto adopta la arquitectura hexagonal (también conocida como "puertos y adaptadores"), que establece una clara separación de las responsabilidades:

src/
├── domain/              # Reglas de negocio, entidades y contratos
│   ├── entities/        # User.entity.ts: Define la estructura de los usuarios.
│   └── repositories/    # Interfaces de repositorios: Contratos para la persistencia de datos (ej., IUserRepository).
├── application/         # Casos de uso y orquestación de la lógica de negocio
│   ├── dtos/            # Objetos de transferencia de datos (Data Transfer Objects) para la validación (ej., auth.dto.ts).
│   ├── services/        # Servicios de la aplicación: Orquestan la lógica entre casos de uso y repositorios (ej., auth.service.ts).
│   └── use-cases/       # Lógica de negocio específica (ej., registro, login - auth.use-case.ts).
└── infrastructure/      # Adaptadores que interactúan con el mundo exterior
    ├── controllers/     # Endpoints de la API REST (ej., auth.controller.ts).
    ├── repositories/    # Implementaciones concretas de los repositorios (ej., MongoUserRepository).
    ├── guards/          # Mecanismos para la protección de rutas (ej., JwtAuthGuard, RolesGuard).
    └── schemas/         # Definiciones de los esquemas de la base de datos (ej., user.schema.ts para MongoDB).


Funcionalidades:
Registro de usuarios: Permite la creación de nuevas cuentas de usuario, con la asignación automática de un rol predeterminado (user).
Inicio de sesión (Login): Genera tokens JWT que contienen información sobre los roles y permisos del usuario autenticado. Estos tokens se utilizan para acceder a rutas protegidas.
Verificación de tokens: Valida la autenticidad y la vigencia de los tokens JWT, asegurando que las sesiones de usuario sigan activas.
Control de acceso: Implementa mecanismos para proteger las rutas de la API, permitiendo el acceso solo a usuarios que posean los roles o permisos necesarios.
Creación de administradores: Proporciona un endpoint protegido (/api/v1/auth/register-admin) que permite a los superadministradores registrar nuevas cuentas con el rol de admin.


Requisitos:
Antes de comenzar, asegúrate de tener instalados y configurados los siguientes elementos en tu entorno de desarrollo:

## Requisitos

Antes de comenzar, asegúrate de tener instalados y configurados los siguientes elementos en tu entorno de desarrollo:

* **Node.js:** Versión 18 o superior.
* **npm** o **yarn:** Gestores de paquetes para JavaScript.
* **TypeScript:** (Implícito con NestJS, pero asegúrate de tener un entorno compatible).
* **Docker:** Plataforma de contenedización.
* **Docker Compose:** Herramienta para definir y gestionar aplicaciones multi-contenedor Docker.
* **MongoDB:** Base de datos NoSQL utilizada para la persistencia de datos.


Crea un archivo .env en la raíz de tu proyecto con la siguiente configuración:


MONGODB_URI=mongodb://mongodb:27017/auth-db
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d
PORT=3000
Asegúrate de reemplazar los valores predeterminados (your-secret-key) con tus propias configuraciones seguras.

Despliegue con Docker
Utiliza Docker y Docker Compose para construir y ejecutar el microservicio:

Bash

# Iniciar los contenedores definidos en docker-compose.yml en segundo plano
docker-compose up -d

# Verificar el estado de los contenedores en ejecución
docker ps

# Ver los logs en tiempo real del contenedor auth-microservice
docker logs -f auth-microservice
API y Endpoints
A continuación, se describen los endpoints disponibles en el microservicio de autenticación:

Método	Endpoint	Descripción	Roles Permitidos
GET	/api/v1/auth/test	Endpoint de prueba para verificar que el servicio está en línea.	Público
POST	/api/v1/auth/register	Permite registrar una nueva cuenta de usuario.	Público
POST	/api/v1/auth/login	Permite a los usuarios iniciar sesión y obtener un token JWT.	Público
POST	/api/v1/auth/register-admin	Permite a los superadministradores registrar nuevos administradores.	super-admin
GET	/api/v1/auth/admin-data	Endpoint de ejemplo que requiere roles de administrador o superadministrador.	admin, super-admin
POST	/api/v1/auth/create-user	Endpoint de ejemplo que requiere el permiso CREATE_USER.	admin, super-admin

Exportar a Hojas de cálculo
Sistema de Roles y Permisos
Roles Disponibles
user: Rol predeterminado para usuarios regulares con permisos básicos.
admin: Rol con permisos extendidos para la administración del sistema.
super-admin: Rol con acceso completo a todas las funcionalidades y permisos del sistema.
Permisos Implementados
Plaintext

CREATE_USER: Permiso para crear nuevas cuentas de usuario.
UPDATE_USER: Permiso para modificar información de usuarios existentes.
DELETE_USER: Permiso para eliminar cuentas de usuario.
VIEW_USERS: Permiso para ver la lista de usuarios.
ADMIN_ACCESS: Permiso para acceder a funcionalidades administrativas.
Ejemplos de Uso con Postman
A continuación, se muestran ejemplos de cómo interactuar con algunos de los endpoints utilizando Postman (o cualquier otro cliente HTTP similar).

Registro de Usuario
Método: POST

URL: /api/v1/auth/register

Encabezado: Content-Type: application/json

Cuerpo (JSON):

JSON

{
  "name": "Usuario Normal",
  "email": "user@example.com",
  "password": "password123"
}
Inicio de Sesión
Método: POST

URL: /api/v1/auth/login

Encabezado: Content-Type: application/json

Cuerpo (JSON):

JSON

{
  "email": "user@example.com",
  "password": "password123"
}
Acceso a Ruta Protegida
Método: GET

URL: /api/v1/auth/admin-data

Encabezado: Authorization: Bearer <token>

Reemplaza <token> con el token JWT obtenido después de iniciar sesión.

Creación de Super-Admin
Por razones de seguridad, la creación del primer superadministrador se realiza manualmente directamente en la base de datos MongoDB:

JavaScript

// Abre la shell de MongoDB
mongosh

// Selecciona la base de datos
use auth-db

// Inserta un nuevo documento de usuario con el rol de super-admin
db.users.insertOne({
  name: "Super Admin",
  email: "super@example.com",
  password: "<contraseña_hasheada>", // ¡Importante! La contraseña debe estar hasheada con bcrypt
  roles: ["super-admin"],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
Nota Importante: Asegúrate de reemplazar <contraseña_hasheada> con la versión encriptada de la contraseña utilizando la biblioteca bcrypt.

Solución de Problemas Comunes
A continuación, se presentan algunos problemas comunes que pueden surgir y sus posibles soluciones:

Error de Conexión a MongoDB
Plaintext

MongooseServerSelectionError: connect ECONNREFUSED
Solución: Verifica que el servicio de MongoDB esté en ejecución (asegúrate de que el contenedor auth-mongodb esté corriendo con docker ps) y que la URI de conexión definida en tu archivo .env (MONGODB_URI) sea correcta y apunte a la ubicación correcta de tu instancia de MongoDB.

Error de Autenticación
Plaintext

Unauthorized: Invalid credentials
Solución: Comprueba cuidadosamente que el email y la contraseña que estás utilizando para iniciar sesión sean correctos y coincidan con los datos de un usuario registrado en la base de datos.

Licencia
Este proyecto está licenciado bajo la MIT License.

Desarrollado con ❤️ usando NestJS y Arquitectura Hexagonal.