# 🔐 Next.js Authentication Project

Un proyecto completo de autenticación usando Next.js 15, NextAuth v4, Prisma y Google OAuth.

## 🚀 Tecnologías Utilizadas

- **Next.js 15.4.3** - Framework React con App Router
- **NextAuth v4.24.11** - Autenticación completa para Next.js
- **Prisma 6.12.0** - ORM para base de datos
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Google OAuth** - Proveedor de autenticación
- **PostgreSQL** - Base de datos (configurable)

## 📁 Estructura del Proyecto

```
next-auth/
├── 📁 prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── migrations/            # Migraciones de Prisma
│
├── 📁 src/
│   ├── 📁 app/                # App Router de Next.js 15
│   │   ├── layout.tsx         # Layout global
│   │   ├── page.tsx           # Página principal
│   │   ├── globals.css        # Estilos globales
│   │   │
│   │   ├── 📁 api/
│   │   │   └── 📁 auth/
│   │   │       └── 📁 [...nextauth]/
│   │   │           └── route.ts    # API routes de NextAuth
│   │   │
│   │   ├── 📁 login/
│   │   │   └── page.tsx       # Página de login
│   │   │
│   │   └── 📁 secure/
│   │       └── page.tsx       # Página protegida
│   │
│   ├── 📁 components/
│   │   ├── logoutButton.tsx   # Botón de cerrar sesión
│   │   └── signinButton.tsx   # Botón de iniciar sesión
│   │
│   ├── 📁 lib/
│   │   ├── authOptions.ts     # Configuración de NextAuth
│   │   └── db.ts              # Cliente de Prisma
│   │
│   ├── 📁 types/
│   │   └── next-auth.d.ts     # Extensión de tipos de NextAuth
│   │
│   └── middleware.ts          # Middleware para proteger rutas
│
├── package.json               # Dependencias y scripts
├── next.config.ts            # Configuración de Next.js
├── tailwind.config.js        # Configuración de Tailwind
└── tsconfig.json             # Configuración de TypeScript
```

## 🔍 Descripción de Directorios

### 📁 `/prisma`
Contiene toda la configuración de la base de datos:
- **`schema.prisma`**: Define el esquema de la base de datos (usuarios, cuentas, sesiones)
- **`migrations/`**: Historial de cambios en la base de datos

### 📁 `/src/app`
Utiliza el nuevo App Router de Next.js 15:
- **`layout.tsx`**: Layout global con SessionProvider
- **`page.tsx`**: Página principal que muestra estado de autenticación
- **`/api/auth/[...nextauth]/route.ts`**: Maneja todas las rutas de autenticación
- **`/login`**: Página dedicada para iniciar sesión
- **`/secure`**: Página protegida que requiere autenticación

### 📁 `/src/components`
Componentes reutilizables:
- **`logoutButton.tsx`**: Botón para cerrar sesión (client component)
- **`signinButton.tsx`**: Botón para iniciar sesión (client component)

### 📁 `/src/lib`
Utilidades y configuraciones:
- **`authOptions.ts`**: Configuración central de NextAuth (proveedores, callbacks, sesiones)
- **`db.ts`**: Cliente de Prisma para interactuar con la base de datos

### 📁 `/src/types`
Extensiones de tipos:
- **`next-auth.d.ts`**: Extiende los tipos de NextAuth para incluir propiedades personalizadas

## 🔐 Cómo Funciona NextAuth

### 1. **Configuración (`authOptions.ts`)**
```typescript
export const authOptions = {
  adapter: PrismaAdapter(prisma),     // Conecta con la base de datos
  providers: [GoogleProvider({...})], // Define proveedores de OAuth
  session: { strategy: "database" },  // Sesiones en base de datos
  callbacks: {                        // Personaliza el comportamiento
    async session({ session, user }) {
      session.user.id = user.id;      // Agrega ID del usuario
      return session;
    },
  },
};
```

### 2. **Flujo de Autenticación**
1. Usuario hace clic en "Iniciar sesión"
2. Redirige a Google OAuth
3. Google valida credenciales
4. NextAuth recibe el token
5. Crea/actualiza usuario en base de datos
6. Genera sesión en base de datos
7. Usuario queda autenticado

### 3. **Protección de Rutas (Middleware)**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Protege rutas específicas
}
export const config = {
  matcher: ['/secure/:path*']  // Rutas protegidas
}
```

---

## 🛡️ Verificar Estado de Autenticación

### 📱 **En Componentes Client**
```typescript
'use client';
import { useSession } from 'next-auth/react';

export default function ClientComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <p>Cargando...</p>;
  
  if (session) {
    return (
      <div>
        <p>¡Hola {session.user?.name}!</p>
        <p>Tu ID: {session.user?.id}</p>
      </div>
    );
  }
  
  return <p>No estás logueado</p>;
}
```

### 🖥️ **En Componentes Server**
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export default async function ServerComponent() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    return (
      <div>
        <p>¡Hola {session.user?.name}!</p>
        <p>Tu email: {session.user?.email}</p>
      </div>
    );
  }
  
  return <p>No estás logueado</p>;
}
```

### 🔒 **En API Routes**
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  return Response.json({ 
    message: `Hola ${session.user?.name}`,
    userId: session.user?.id 
  });
}
```

---

## 🛡️ Configurar Middleware para Más Rutas

### **Configuración Básica**
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    console.log('Ruta protegida:', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/secure/:path*',     // Protege /secure y subrutas
    '/admin/:path*',      // Protege /admin y subrutas
    '/dashboard/:path*',  // Protege /dashboard y subrutas
    '/profile/:path*'     // Protege /profile y subrutas
  ]
};
```

### **Configuración Avanzada con Roles**
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Lógica adicional aquí
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    
    // Ejemplo: Solo admins pueden acceder a /admin
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return Response.redirect(new URL('/unauthorized', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Siempre permitir páginas públicas
        if (!pathname.startsWith('/secure') && 
            !pathname.startsWith('/admin') && 
            !pathname.startsWith('/dashboard')) {
          return true;
        }
        
        // Requiere autenticación para rutas protegidas
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api/auth (rutas de NextAuth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### **Protección Específica por Ruta**
```typescript
export const config = {
  matcher: [
    // Rutas específicas
    '/secure',
    '/secure/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    
    // API routes protegidas
    '/api/users/:path*',
    '/api/admin/:path*',
    
    // Excluir rutas específicas
    '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico|login|$).*)',
  ]
};
```

## 🚀 Instalación y Uso

1. **Clonar repositorio**
```bash
git clone <repo-url>
cd next-auth
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-super-secreto
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
DATABASE_URL="postgresql://usuario:password@localhost:5432/dbname"
```

4. **Configurar base de datos**
```bash
npx prisma migrate dev
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

¡Tu aplicación estará disponible en `http://localhost:3000`! 🎉

Consulta la [documentación oficial de NextAuth.js](https://next-auth.js.org/) para más detalles.
