# Sitio Web de Masajes - NextJS

Sitio web profesional para negocio de masajes con sistema de reservas, desarrollado con NextJS 14, TypeScript, Tailwind CSS y PostgreSQL.

## 🚀 Características

- ✅ Landing page optimizada para SEO
- ✅ Sistema de reservas en línea
- ✅ Panel administrativo
- ✅ Formulario de contacto
- ✅ Diseño responsive
- ✅ Base de datos PostgreSQL con Docker
- ✅ Autenticación segura

## 🛠️ Stack Tecnológico

- **Frontend**: NextJS 14, TypeScript, Tailwind CSS
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Containerización**: Docker & Docker Compose
- **Autenticación**: NextAuth.js
- **Email**: Resend/SendGrid
- **Validación**: Zod

## 📋 Requisitos Previos

- Node.js 18+
- Docker y Docker Compose
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd sitio-masajes
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

### 4. Iniciar base de datos con Docker
```bash
docker-compose up -d postgres
```

### 5. Configurar Prisma y base de datos
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar schema a la base de datos
npm run db:push

# Poblar base de datos con datos de ejemplo
npm run db:seed
```

### 6. Iniciar servidor de desarrollo
```bash
npm run dev
```

El sitio estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
sitio-masajes/
├── src/
│   ├── app/                    # App Router de NextJS 14
│   │   ├── (pages)/           # Rutas agrupadas
│   │   ├── api/               # API Routes
│   │   └── admin/             # Panel administrativo
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base
│   │   ├── forms/            # Formularios
│   │   ├── calendar/         # Calendario
│   │   └── layout/           # Layout
│   ├── lib/                  # Utilidades
│   └── types/                # Tipos TypeScript
├── prisma/                   # Configuración Prisma
├── docker-compose.yml        # Docker Compose
└── Dockerfile               # Imagen Docker
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Iniciar servidor de producción
- `npm run lint` - Ejecutar ESLint
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:push` - Aplicar schema a la base de datos
- `npm run db:seed` - Poblar base de datos con datos de ejemplo
- `npm run db:studio` - Abrir Prisma Studio

## 🐳 Docker

### Iniciar solo la base de datos:
```bash
docker-compose up -d postgres
```

### Iniciar toda la aplicación:
```bash
docker-compose up -d
```

## 📝 Estado del Desarrollo

- ✅ **Tarea 1**: Estructura inicial y configuración Docker
- ✅ **Tarea 2**: Configuración de Prisma y base de datos
- ⏳ **Tarea 3**: Componentes UI base
- ⏳ **Siguientes tareas**: Ver `tasks.md` en `.kiro/specs/sitio-web-masajes/`

## 🗄️ Base de Datos

La base de datos incluye:
- **Servicios**: 4 tipos de masajes con precios y descripciones
- **Disponibilidad**: Horarios de trabajo (Lun-Vie 9:00-18:00, Sáb 10:00-16:00)
- **Reservas**: Sistema completo de gestión de citas

### Endpoints de API disponibles:
- `GET /api/servicios` - Lista de servicios activos
- `GET /api/test-db` - Prueba de conexión a base de datos

## 🤝 Contribución

Este proyecto sigue el spec definido en `.kiro/specs/sitio-web-masajes/`. Consulta los documentos de requerimientos, diseño y tareas para más detalles.

## 📄 Licencia

Proyecto privado para negocio de masajes.