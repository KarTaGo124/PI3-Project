# Monitoreo Médico - La Oroya

Plataforma full-stack para el seguimiento médico de exposición a metales pesados en niños.

**Stack:** Next.js 16 + Supabase + React 19 + TypeScript

---

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
# http://localhost:3000
```

**📖 Documentación Completa:** [GUIA.md](./GUIA.md)

---

## ¿Qué es este proyecto?

Sistema de monitoreo médico diseñado para postas rurales en La Oroya, Perú. Permite a médicos:
- Registrar y monitorear pacientes expuestos a metales pesados
- Ver alertas automáticas cuando los niveles son críticos
- Generar derivaciones a especialistas
- Consultar historiales y gráficos de evolución

---

## Características Principales

### Frontend
- Dashboard con KPIs en tiempo real
- Autenticación (login/signup)
- Gestión de pacientes con wizard de 3 pasos
- Gráficos interactivos
- Búsqueda avanzada con filtros
- Generación de derivaciones PDF

### Backend
- 10+ endpoints RESTful
- Autenticación con Supabase Auth
- APIs protegidas con middleware
- Validación de datos

### Base de Datos
- PostgreSQL con Supabase
- Row Level Security (RLS)
- 3 tablas: patients, metal_tests, alerts
- Datos de ejemplo incluidos

---

## Instalación

```bash
# 1. Clonar e instalar
git clone <repo>
cd PI3-Project
npm install

# 2. Configurar Supabase
# Crear proyecto en supabase.com
# Copiar credenciales a .env.local

# 3. Ejecutar script SQL
# En Supabase SQL Editor: ejecutar /scripts/seed-db.sql

# 4. Ejecutar localmente
npm run dev
```

**Ver [GUIA.md](./GUIA.md) para instrucciones detalladas paso a paso.**

---

## Estructura del Proyecto

```
PI3-Project/
├── app/
│   ├── api/              # Backend (API Routes)
│   ├── dashboard/        # Dashboard principal
│   ├── patients/         # Gestión de pacientes
│   └── login/signup/     # Autenticación
├── components/
│   ├── dashboard/        # KPIs, alertas
│   ├── patients/         # Registro, gráficos
│   └── ui/               # Componentes shadcn
├── lib/
│   ├── supabase-*.ts     # Clientes Supabase
│   └── alert-service.ts  # Lógica de alertas
└── scripts/
    └── seed-db.sql       # Script SQL completo
```

---

## Umbrales Médicos

| Metal | Normal | Alerta | Crítico |
|-------|--------|--------|---------|
| Plomo | < 25 µg/dL | ≥ 25 | ≥ 45 |
| Cadmio | < 1.5 µg/L | ≥ 1.5 | ≥ 2.5 |
| Arsénico | < 8 µg/L | ≥ 8 | ≥ 15 |

---

## Deployment

```bash
# Vercel (recomendado)
vercel

# O conecta GitHub a Vercel
# Agrega variables de entorno en Vercel Dashboard
```

**Ver [GUIA.md](./GUIA.md#deployment-a-vercel) para más detalles.**

---

## Documentación

📖 **[GUIA.md](./GUIA.md)** - Guía completa con:
- Inicio rápido (5 minutos)
- Configuración de Supabase
- Ejemplos de código
- Deployment a Vercel
- Troubleshooting

---

## Licencia

MIT License

---

## Contacto

Para soporte: soporte@monitoreo-medico.pe
