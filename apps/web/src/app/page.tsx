import Image from "next/image";
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  ExternalLink,
  MonitorPlay,
  Radio,
  Vote,
} from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const servicios = [
  {
    icon: Boxes,
    title: "Un espacio por programa",
    description:
      "Cada programa trabaja aislado: sus juegos, sus datos y su equipo, sin pisarse con los demás.",
  },
  {
    icon: ClipboardList,
    title: "Carga antes del aire",
    description:
      "La producción prepara los datos de cada juego con calma, listos para salir en vivo.",
  },
  {
    icon: MonitorPlay,
    title: "Render a pantalla completa",
    description:
      "Los juegos se muestran en pantalla durante la transmisión, sincronizados con el programa.",
  },
  {
    icon: Vote,
    title: "Participación de la audiencia",
    description:
      "Votaciones y tableros para conductores que suman al show en tiempo real.",
  },
];

const clientes = [
  {
    nombre: "Que Gane El Mejor",
    canal: "TV Perú",
    img: "/clientes/que-gane-el-mejor.jpg",
    url: "https://www.tvperu.gob.pe/programas/que-gane-el-mejor",
  },
  {
    nombre: "Pukllaspa Yachay",
    canal: "TV Perú",
    img: "/clientes/pukllaspa-yachay.jpg",
    url: "https://www.tvperu.gob.pe/programas/pukllaspa-yachay",
  },
  {
    nombre: "Más Conectados",
    canal: "TV Perú",
    img: "/clientes/mas-conectados.jpg",
    url: "https://www.tvperu.gob.pe/programas/mas-conectados",
  },
];

const pasos = [
  {
    n: "01",
    title: "Prepara",
    description: "El equipo llena los datos de los juegos desde la app.",
  },
  {
    n: "02",
    title: "Emite",
    description: "Durante el vivo, cada juego se renderiza en pantalla.",
  },
  {
    n: "03",
    title: "Interactúa",
    description: "La audiencia participa y el programa reacciona al momento.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Radio className="size-4" />
            </span>
            Ronda
          </div>
          <AuthButton />
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[500px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-primary)_0%,transparent_70%)] opacity-20"
          />
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
            <Badge variant="secondary">
              <Radio className="text-primary" /> Juegos para TV en vivo
            </Badge>
            <h1 className="font-heading max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
              Crea y emite juegos interactivos para tu programa en{" "}
              <span className="text-primary">vivo</span>
            </h1>
            <p className="max-w-2xl text-balance text-lg text-muted-foreground">
              Una sola plataforma para producir los juegos antes del aire y
              mostrarlos en pantalla durante la transmisión. Multi-programa
              desde el primer día.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg">
                Empezar <ArrowRight />
              </Button>
              <Button size="lg" variant="outline">
                Conocer más
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nombre provisional · en construcción
            </p>
          </div>
        </section>

        <section className="border-b bg-muted/40 py-12">
          <div className="mx-auto w-full max-w-5xl px-6">
            <p className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Ya salieron al aire con Ronda
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {clientes.map(({ nombre, canal, img, url }) => (
                <a
                  key={nombre}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      unoptimized
                      loading="eager"
                      src={img}
                      alt={`Logo de ${nombre}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <span>
                      <span className="block font-heading font-semibold leading-tight group-hover:text-primary">
                        {nombre}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {canal}
                      </span>
                    </span>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              ¿Qué es Ronda?
            </h2>
            <p className="mt-4 text-balance text-muted-foreground">
              Consolida en un solo lugar lo que antes eran dos herramientas
              sueltas —un colector de datos y un visor de juegos— y lo hace
              multi-programa: cada cliente tiene su propio espacio dentro de la
              misma plataforma, sin despliegues separados.
            </p>
          </div>
        </section>

        <section className="border-t bg-muted/40 py-20">
          <div className="mx-auto w-full max-w-5xl px-6">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-3xl font-semibold tracking-tight">
                ¿Qué brindamos?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Todo lo necesario para llevar un juego del papel al aire.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {servicios.map(({ icon: Icon, title, description }) => (
                <Card key={title}>
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Cómo funciona
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {pasos.map(({ n, title, description }) => (
              <div key={n} className="space-y-2">
                <div className="font-heading text-4xl font-semibold text-primary">
                  {n}
                </div>
                <h3 className="font-heading text-xl font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 pb-24">
          <Card className="border-0 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
              <h2 className="font-heading max-w-xl text-balance text-3xl font-semibold tracking-tight">
                ¿Produces un programa en vivo? Dale su espacio.
              </h2>
              <Button size="lg" variant="secondary">
                Empezar <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
            <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Radio className="size-3.5" />
            </span>
            Ronda
          </div>
          <p>BroadStream Coders © 2026 · Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
