# Ronda

> Nombre provisional — sujeto a rebranding.

**Ronda** es una plataforma **multi-programa** que le da servicios a programas de
TV. Cada programa (cliente) tiene su propio espacio aislado dentro de la misma
aplicación, y ahí usa los servicios que haya contratado.

El servicio en desarrollo hoy —y el más pedido— es el **Colector**: la herramienta
donde la producción de un programa llena, antes del aire, los datos de sus juegos.
Las palabras de un deletreo, las preguntas de una ronda, las fotos de un álbum.

## El problema que resuelve

Antes cada programa se atendía con herramientas sueltas, un proyecto por
necesidad. Eso no escala: sumar un cliente significaba otro despliegue, otra copia
de todo, y ningún lugar natural para lo que no pertenece a un juego en particular
(el acceso de la gente, los archivos compartidos, el histórico).

La salida es **multi-programa** (*multi-tenant*): una sola aplicación con los datos
particionados por programa. Un programa nuevo no es un proyecto nuevo ni un
despliegue nuevo — es una fila más en la base.

## Servicios

### Colector — en desarrollo

Cada juego tiene su propio colector: un editor hecho a la medida de ese juego. Se
arman sobre un **kit compartido** (grilla de columnas/filas, pestañas por nivel,
barra superior con guardar/cargar, pegado rápido desde una planilla), así que cada
juego nuevo solo aporta su forma particular en vez de reconstruir todo.

Un programa ve únicamente los colectores que tiene asignados: los juegos de un
cliente no aparecen —ni son alcanzables por URL— desde el espacio de otro.

El resultado se guarda hoy como **archivo local** (`json`, o `zip` cuando el juego
lleva imágenes), que es como se lleva al aire. Persistirlo en la nube está
evaluado y anotado en la wishlist, no comprometido.

### Más adelante

Otros servicios sobre el mismo espacio por programa (visor para el aire, storage
compartido, apoyo a conductores) son posibles, pero **no están comprometidos** ni
modelados. Se agregan si un programa los pide.

## Cómo está construido

- **Next.js 16** + **React 19** (App Router) — `apps/web`, único deployable.
- **Tailwind CSS v4** + **shadcn/ui** (estilo `base-nova`, primitivos Base UI).
- **Supabase** — base de datos, autenticación (login con Google) y storage.
- **pnpm** · **TypeScript** (strict).

Dos decisiones que conviene conocer antes de tocar código:

- **El aislamiento vive en la base**, no en infraestructura separada: columna
  `program_id` + políticas RLS por fila. Quién ve qué se decide en Postgres, no en
  la app, así que un descuido en una página no puede filtrar datos de otro
  programa.
- **El acceso a datos está encapsulado** en `src/data/`. Todo lo que habla con
  Supabase pasa por ahí, para poder reemplazarlo por una API propia sin reescribir
  la aplicación.

## Estructura del repositorio

```
Ronda/
├── apps/
│   └── web/                  # Aplicación Next.js (autónoma; Vercel apunta acá)
│       ├── src/
│       │   ├── app/          # Rutas (App Router)
│       │   ├── collector/    # El servicio Colector: kit compartido + catálogo de juegos
│       │   ├── data/         # Única capa que habla con Supabase
│       │   └── components/   # UI compartida
│       └── supabase/
│           └── migrations/   # Esquema versionado (tablas + RLS)
├── docs/
│   └── logbook/              # Seguimiento del proyecto
└── LICENSE
```

## Estado

En desarrollo. Las bases están puestas (programas, membresías, panel de admin,
kit del colector, primer juego portado); lo que sigue es portar el resto del
catálogo de juegos.

El trabajo comprometido y su avance se lleva en
[`docs/logbook/`](docs/logbook/): [roadmap](docs/logbook/roadmap.md) ·
[deuda técnica](docs/logbook/technical-debt.md) ·
[wishlist](docs/logbook/wishlist.md) · [changelog](docs/logbook/changelog.md).

## Licencia

Software propietario — **todos los derechos reservados**. El repositorio es público
solo por requisitos de despliegue; su publicación no otorga ningún derecho de uso.
Ver [`LICENSE`](LICENSE).

---

BroadStream Coders © 2026
