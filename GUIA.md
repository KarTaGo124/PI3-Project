# Guía Completa - Monitoreo Médico La Oroya

Plataforma full-stack para el seguimiento médico de exposición a metales pesados en niños. Next.js 16 + Supabase + React 19 + TypeScript.

---

## 📋 ¿Qué es este proyecto?

Sistema de monitoreo médico diseñado para postas rurales en La Oroya, Perú. Permite a médicos generales:
- Registrar y monitorear pacientes expuestos a metales pesados (Plomo, Cadmio, Arsénico)
- Ver alertas automáticas cuando los niveles son críticos
- Generar derivaciones a especialistas
- Consultar historiales y gráficos de evolución

**Stack Tecnológico:**
- Frontend: React 19 + Next.js 16 + TypeScript + Tailwind CSS
- Backend: Next.js API Routes
- Base de Datos: Supabase (PostgreSQL con RLS)
- Autenticación: Supabase Auth

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Supabase

**A. Crear proyecto en Supabase:**
1. Ve a [supabase.com](https://supabase.com) → Crea cuenta
2. Nuevo proyecto → Nombre: `monitoreo-medico` → Región: São Paulo
3. Espera 2-3 minutos

**B. Obtener credenciales:**
1. En Supabase: Settings → API
2. Copia:
   - `Project URL`: `https://xxx.supabase.co`
   - `anon public key`: `eyJ...`

**C. Crear archivo `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Ejecutar Script SQL

1. En Supabase: SQL Editor → New query
2. Copia TODO el contenido de `/scripts/seed-db.sql`
3. Pégalo y haz clic en "RUN"
4. Espera "✓ Success"

**⚠️ Importante:** Usa SOLO `seed-db.sql` (incluye tablas + RLS + datos de ejemplo)

### 4. Ejecutar Localmente
```bash
npm run dev
# Abre http://localhost:3000
```

### 5. Probar
1. Clic "Crear Cuenta"
2. Email: `test@test.com` | Password: `Test123!`
3. ✅ Deberías ver el dashboard

---

## 🗄️ Base de Datos

### Tablas Creadas
- **patients**: Información de pacientes (nombre, edad, tutor, ubicación)
- **metal_tests**: Tests de metales pesados con niveles
- **alerts**: Alertas generadas automáticamente

### Umbrales Médicos
| Metal | Normal | Alerta | Crítico | Unidad |
|-------|--------|--------|---------|--------|
| Plomo | < 25 | ≥ 25 | ≥ 45 | µg/dL |
| Cadmio | < 1.5 | ≥ 1.5 | ≥ 2.5 | µg/L |
| Arsénico | < 8 | ≥ 8 | ≥ 15 | µg/L |

### Verificar que Funciona
En Supabase → Table Editor:
- Deberías ver 3 tablas
- `patients` debe tener 3-4 registros de ejemplo

---

## 💻 Desarrollo

### Estructura del Proyecto
```
PI3-Project/
├── app/
│   ├── api/                    # Backend (API Routes)
│   │   ├── auth/              # Login, signup, logout
│   │   ├── patients/          # CRUD de pacientes
│   │   └── tests/             # CRUD de tests
│   ├── dashboard/             # Dashboard principal
│   ├── patients/              # Gestión de pacientes
│   ├── search/                # Búsqueda avanzada
│   └── login/signup/          # Autenticación
├── components/
│   ├── dashboard/             # KPIs, alertas, lista
│   ├── patients/              # Registro, gráficos, derivaciones
│   └── ui/                    # Componentes shadcn
├── lib/
│   ├── supabase-client.ts     # Cliente Supabase (browser)
│   ├── supabase-server.ts     # Cliente Supabase (servidor)
│   └── alert-service.ts       # Lógica de alertas
└── scripts/
    └── seed-db.sql            # Script SQL completo
```

### Arquitectura

**Frontend → Backend → Base de Datos**

1. Usuario hace login → `/api/auth/login`
2. Supabase Auth valida credenciales
3. Sesión guardada en cookies HTTP-only
4. Middleware valida sesión en cada request
5. APIs protegidas por autenticación
6. RLS protege datos en BD

### Ejemplos de Código Esenciales

**Obtener pacientes:**
```typescript
'use client';
import { useEffect, useState } from 'react';

export function PatientList() {
  const [patients, setPatients] = useState([]);
  
  useEffect(() => {
    fetch('/api/patients')
      .then(r => r.json())
      .then(d => setPatients(d.patients));
  }, []);
  
  return patients.map(p => <div key={p.id}>{p.first_name}</div>);
}
```

**Crear paciente:**
```typescript
const response = await fetch('/api/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'Juan',
    last_name: 'Pérez',
    age: 7,
    gender: 'M',
    location: 'La Oroya',
    guardian_name: 'María',
    guardian_phone: '987654321'
  })
});
```

**Crear test de metales:**
```typescript
await fetch('/api/tests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patient_id: 1,
    test_date: '2024-01-15',
    lead_level: 52.5,
    cadmium_level: 1.2,
    arsenic_level: 9.5
  })
});
```

### APIs Disponibles

**Autenticación:**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/signup` - Crear cuenta
- `POST /api/auth/logout` - Cerrar sesión

**Pacientes:**
- `GET /api/patients` - Obtener todos
- `POST /api/patients` - Crear nuevo
- `GET /api/patients/[id]` - Obtener específico
- `PUT /api/patients/[id]` - Actualizar

**Tests:**
- `GET /api/tests?patient_id=1` - Obtener tests de un paciente
- `POST /api/tests` - Crear nuevo test

---

## 🚀 Deployment a Vercel

### Opción 1: GitHub + Vercel (Recomendado)
```bash
# 1. Sube a GitHub
git add .
git commit -m "Deploy"
git push

# 2. En Vercel.com:
# - New Project → Import from Git
# - Select tu repo
# - Add Environment Variables (las 2 de Supabase)
# - Deploy
```

### Opción 2: Vercel CLI
```bash
npm install -g vercel
vercel
# Sigue instrucciones
# Agrega env vars cuando te lo pida
```

### Variables de Entorno en Vercel
En Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🔧 Troubleshooting

### "Cannot read properties of undefined"
- ✅ Verifica que `.env.local` existe
- ✅ Variables tienen prefijo `NEXT_PUBLIC_`
- ✅ Reinicia: `npm run dev`

### "Invalid API Key"
- ✅ Copia bien la `anon public` key de Supabase
- ✅ No uses la `service_role` key

### "Project not found"
- ✅ Verifica que la URL de Supabase es correcta
- ✅ Proyecto existe en Supabase dashboard

### "Relation does not exist"
- ✅ Ejecuta el script SQL en Supabase
- ✅ Verifica en Table Editor que las tablas existen

### Login no funciona
- ✅ ¿Creaste cuenta primero?
- ✅ Variables de Supabase correctas?
- ✅ Revisa consola del navegador (F12)

### Datos no aparecen
- ✅ Script SQL ejecutado?
- ✅ En Supabase Table Editor: ¿ves datos?
- ✅ Revisa Network tab en DevTools

---

## 📝 Características Principales

### Dashboard
- KPIs en tiempo real (casos críticos, total pacientes, alertas)
- Lista de pacientes recientes
- Sección de alertas críticas
- Acceso rápido a funciones principales

### Gestión de Pacientes
- Wizard de registro en 3 pasos
- Perfiles detallados con información completa
- Gráficos de evolución de metales
- Historial de tests

### Sistema de Alertas
- Alertas automáticas basadas en umbrales
- 3 niveles: Normal, Alerta, Crítico
- Colores semánticos (verde, amarillo, rojo)
- Notificaciones visuales

### Búsqueda Avanzada
- Búsqueda por nombre en tiempo real
- Filtros por estado (Normal/Alerta/Crítico)
- Filtros por edad
- Contador de resultados

### Derivaciones
- Generación de derivaciones a especialistas
- Selección de especialidad
- Niveles de urgencia
- Generación de PDF

### Seguridad
- Autenticación con Supabase Auth
- Row Level Security (RLS) en BD
- Middleware de protección de rutas
- Cookies HTTP-only
- Validación en cliente y servidor

---

## ✅ Checklist de Producción

Antes de deployar:
- [ ] Script SQL ejecutado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Login/Signup funciona localmente
- [ ] APIs probadas
- [ ] Testing en navegadores
- [ ] Código en GitHub
- [ ] Variables en Vercel
- [ ] Deploy exitoso
- [ ] Prueba en producción

---

## 📞 Soporte

**Documentación oficial:**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)

**Si hay problemas:**
1. Revisa la consola del navegador (F12)
2. Revisa Network tab en DevTools
3. Verifica logs en Supabase → Logs
4. Verifica variables de entorno

---

**¡Listo para producción! 🚀**
