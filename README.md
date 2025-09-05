# 💰 Sistema de Gestión de Deudas

Una aplicación web full-stack para gestionar deudas personales con autenticación JWT y control de sesiones.

## 🚀 Características

- **Autenticación segura** con JWT y control de sesiones de 1 hora
- **Gestión completa de deudas**: crear, editar, eliminar y marcar como pagadas
- **Filtros dinámicos**: ver todas las deudas, solo pendientes o solo pagadas
- **Exportación a CSV** para reportes
- **Interfaz responsive** con Tailwind CSS
- **Validación de datos** en frontend y backend
- **Manejo automático de sesiones expiradas**

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** con TypeScript
- **Tailwind CSS** para estilos
- **React Router DOM** para navegación
- **Axios** para peticiones HTTP

### Backend
- **Node.js** con Express
- **TypeScript** para tipado estático
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **bcrypt** para hash de contraseñas
- **Simulación de cache en memoria** para control de sesiones

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- PostgreSQL
- npm o yarn

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <https://github.com/restreponietoyurani-beep/api-deudas-node>
cd proyecto-deudas
```

### 2. Configurar la base de datos

Crear una base de datos PostgreSQL y ejecutar el siguiente script:

```sql
-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    email character varying(150) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- Crear tabla de deudas
CREATE TABLE IF NOT EXISTS public.debts
(
    id integer NOT NULL DEFAULT nextval('debts_id_seq'::regclass),
    user_id integer NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    amount numeric(12,2) NOT NULL,
    is_paid boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT debts_pkey PRIMARY KEY (id),
    CONSTRAINT debts_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT debts_amount_check CHECK (amount >= 0::numeric)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.debts
    OWNER to postgres;
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del backend:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=deudas_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura

# Puerto del servidor
PORT=4000
```

### 4. Instalar dependencias del backend

```bash
cd backend-deudas-node-ts
npm install
```

### 5. Instalar dependencias del frontend

```bash
cd ../front-deudas-react/frontend
npm install
```

## 🚀 Ejecución Local

### Backend
```bash
cd backend-deudas-node-ts
npm run dev
```
El servidor estará disponible en `http://localhost:4000`

### Frontend
```bash
cd front-deudas-react/frontend
npm start
```
La aplicación estará disponible en `http://localhost:3000`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión

### Deudas
- `GET /api/debts` - Listar deudas del usuario
- `POST /api/debts` - Crear nueva deuda
- `GET /api/debts/:id` - Obtener deuda por ID
- `PUT /api/debts/:id` - Editar deuda
- `DELETE /api/debts/:id` - Eliminar deuda
- `PATCH /api/debts/:id/pay` - Marcar como pagada
- `GET /api/debts/export` - Exportar deudas a CSV
- `GET /api/debts/summary` - Resumen de deudas

## 🏗️ Decisiones Técnicas

### 1. **Arquitectura de Autenticación**
- **JWT con cache en memoria**: Para mantener sesiones seguras y evitar almacenar contraseñas planas.
- **Cache simulada con Map**: para cumplir el requerimiento de Redis/DynamoDB, controlando la expiración de tokens.

### 2. **Gestión de Estado**
- **Estado local con React hooks**: Simple y eficiente para una aplicación pequeña
- **localStorage**: Persistencia básica del token de autenticación

### 3. **Base de Datos**
- **PostgreSQL**: Robustez y soporte para relaciones
- **Pool de conexiones**: Optimización de recursos
- **Cascada en eliminación**: Integridad referencial automática

### 4. **Interfaz de Usuario**
- **Tailwind CSS**: Desarrollo rápido y consistencia visual
- **Componentes funcionales**: Arquitectura moderna de React
- **Manejo de errores**: UX clara con mensajes informativos

### 5. **Seguridad**
- **Hash de contraseñas**: bcrypt para protección
- **Validación de entrada**: Frontend y backend
- **CORS configurado**: Control de acceso desde el frontend

## 🔒 Flujo de Autenticación

1. **Login**: Usuario se autentica → JWT generado → Token guardado en cache (1 hora)
2. **Peticiones**: Token enviado en header → Middleware verifica JWT y cache
3. **Expiración**: Token expira → Cache se limpia → Usuario redirigido al login
4. **Logout**: Token eliminado de cache → localStorage limpiado

## 📁 Estructura del Proyecto

```
proyecto-deudas/
├── backend-deudas-node-ts/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Middlewares de autenticación
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/        # Servicios (cache, etc.)
│   │   ├── db.ts           # Configuración de base de datos
│   │   └── index.ts        # Punto de entrada
│   └── package.json
├── front-deudas-react/
│   └── frontend/
│       ├── src/
│       │   ├── pages/       # Componentes de páginas
│       │   ├── App.tsx      # Componente principal
│       │   └── index.tsx    # Punto de entrada
│       └── package.json
└── README.md
```

##Preguntas de Arquitectura
### 1. **Microservicios: Migración de Monolito a Microservicios**

Si el sistema creciera, dividiría los servicios de la siguiente manera:

#### **División de Servicios:**
- **Auth Service**: Autenticación, autorización y gestión de usuarios
- **Debts Service**: CRUD de deudas, pagos, filtros y exportación
- **Notification Service**: Alertas, recordatorios y notificaciones
- **Analytics Service**: Reportes, estadísticas y métricas
- **User Management Service**: Perfiles, configuraciones y preferencias

#### **Consideraciones de Comunicación:**
- **sincrónica con REST/GraphQL**: para consultas directas
- **asíncrona con colas (ej. AWS SQS/Kafka)**: para eventos (ej. cuando se paga una deuda, notificar a reportes).
- **service discovery**: y observabilidad (logs centralizados, métricas, tracing distribuido).

### 2. **Optimización en la Nube (AWS)**
- **Autenticación segura**: **AWS Cognito** para manejar registro/login sin gestionar contraseñas manualmente.
- **Base de datos**: **Amazon RDS con PostgreSQL** por su robustez relacional y facilidad de administración.
- **Cache y escalabilidad**: **Amazon ElastiCache (Redis)** para sesiones y consultas rápidas.
- **Balanceo de carga**: **Elastic Load Balancer (ALB)** para distribuir tráfico entre instancias backend.

### 3. **Buenas Prácticas de Seguridad**

- **Backend**:
  - Validación estricta de entradas (SQL Injection, XSS).
  - Tokens JWT con expiración corta y refresh tokens.
  - Encriptación de contraseñas con bcrypt/argon2.
- **Frontend**:
  - Nunca exponer claves secretas en el código.
  - Uso de HTTPS y sanitización de datos mostrados.
- **Nube/Despliegue**:
  - Uso de **IAM Roles** con privilegios mínimos en AWS.
  - Monitoreo y alertas con **CloudWatch**.
  - Secrets en **AWS Secrets Manager** (no en .env públicos).

### 4. **PostgreSQL vs NoSQL**

#### **PostgreSQL (Relacional):**
**Usar cuando:**
- **Transacciones ACID**: Sistema bancario, e-commerce
- **Relaciones complejas**: Sistema de gestión de inventario
- **Consultas complejas**: Reportes financieros con múltiples JOINs
- **Consistencia de datos**: Sistema de reservas de hotel

**Ejemplo concreto:**
```sql
-- Sistema de facturación con múltiples tablas relacionadas
SELECT c.name, SUM(i.amount) 
FROM customers c
JOIN invoices i ON c.id = i.customer_id
JOIN invoice_items ii ON i.id = ii.invoice_id
WHERE i.date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY c.id, c.name;
```

#### **NoSQL (MongoDB/DynamoDB):**
**Usar cuando:**
- **Escalabilidad horizontal**: Redes sociales, IoT
- **Datos no estructurados**: Logs de aplicaciones, contenido multimedia
- **Desarrollo rápido**: Prototipos, MVP
- **Alta disponibilidad**: Sistemas de notificaciones en tiempo real

**Ejemplo concreto:**
```javascript
// Sistema de logs de aplicaciones
{
  "_id": ObjectId("..."),
  "timestamp": ISODate("2024-01-15T10:30:00Z"),
  "level": "ERROR",
  "message": "Database connection failed",
  "metadata": {
    "userId": "12345",
    "sessionId": "abc-def-ghi",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "stackTrace": "..."
  }
}
```

### 5. **Pipeline CI/CD para Producción**

Pipeline CI/CD ideal:
1. **Commit a GitHub** → dispara workflow en GitHub Actions.
2. **Etapa de CI**:
   - Linter (ESLint/Prettier).
   - Tests unitarios y de integración (Jest/Supertest).
   - Build de frontend y backend.
3. **Etapa de CD**:
   - Crear imagen Docker y subir a **Amazon ECR**.
   - Desplegar en **ECS/Fargate o EKS** con blue-green deployment.
   - Migraciones de base de datos automáticas (ej. con Prisma/Migrate o Flyway).
   - Notificación en Slack/Email cuando el despliegue finaliza.

Esto asegura **calidad, trazabilidad y despliegues continuos sin downtime**
