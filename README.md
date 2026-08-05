# Ronda

> Nombre provisional — sujeto a rebranding.

**Ronda** es una plataforma para crear y emitir **juegos interactivos para programas de TV en vivo**. La producción de cada programa llena los datos de sus juegos antes del aire, y esos juegos se renderizan en pantalla completa durante la transmisión.

Nace de consolidar en un solo lugar lo que antes eran dos proyectos separados (un colector de datos y un visor de juegos), y de resolver el problema que apareció al escalar: dar servicio a **varios programas de TV a la vez** sin que se pisen entre sí.

## El problema que resuelve

Cada programa (cliente) necesita su propio espacio: sus juegos, sus datos, su gente — aislados de los demás. Antes, meter todo en un mismo entorno no escalaba y volvía difícil ubicar funcionalidades que no pertenecen ni al colector ni al visor (storage compartido, tablas para conductores, votación de la audiencia).

La solución es **multi-tenant**: una sola aplicación donde los datos están particionados por programa. Un programa nuevo no es un proyecto nuevo ni un despliegue nuevo — es un espacio más dentro de la misma plataforma.

## Cómo funciona (a grandes rasgos)

- Cada **programa** es un *tenant* aislado. Al iniciar sesión, cada quien ve solo su espacio.
- El aislamiento vive en la base de datos (`tenant_id` + políticas de acceso por fila), no en infraestructura separada.
- Los datos de cada juego se llenan en la app, se guardan en la nube y se renderizan para el aire.

## Stack

- **Next.js 16** + **React 19** (App Router) — `apps/web`
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** — base de datos, autenticación (login con Google) y storage
- **pnpm** · **TypeScript** (strict)

> El acceso a datos se aísla tras una capa propia (`src/data/`) para poder reemplazar Supabase por una API propia en el futuro sin reescribir la app.

## Estructura del repositorio

```
Ronda/
├── apps/
│   └── web/          # Aplicación Next.js (autónoma; se despliega apuntando Vercel aquí)
├── docs/
│   └── logbook/      # Seguimiento del proyecto (roadmap, deuda, changelog)
└── LICENSE
```

## Estado

En desarrollo — sentando las bases. El trabajo comprometido y su avance se lleva en
[`docs/logbook/roadmap.md`](docs/logbook/roadmap.md).

## Licencia

Software propietario — **todos los derechos reservados**. El repositorio es público
solo por requisitos de despliegue; su publicación no otorga ningún derecho de uso.
Ver [`LICENSE`](LICENSE).

---

BroadStream Coders © 2026
