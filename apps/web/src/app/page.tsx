import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardList,
  ExternalLink,
  Layers,
  Mail,
  Phone,
  ShieldCheck,
  Signal,
  Zap,
} from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { InquiryForm } from "@/components/inquiry-form";
import { RondaLogo, RondaMark } from "@/components/ronda-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { createClient } from "@/data/supabase/server";
import { isPlatformAdmin } from "@/data/admin";
import { listPrograms } from "@/data/programs";
import { sendInquiryAction } from "./actions";

const CONTAINER = "mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,40px)]";
const SECTION_Y = "py-[clamp(64px,8vw,104px)]";
const EYEBROW =
  "text-[13px] font-bold uppercase tracking-[0.14em] text-accent mb-3.5";
const H2 =
  "font-heading text-[clamp(30px,3.6vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em]";
const CARD =
  "rounded-[calc(var(--radius)*1.3)] border border-border bg-card p-[30px]";
const PILL =
  "self-start rounded-full px-2.5 py-[5px] text-xs font-bold tracking-[0.03em]";

const clientes = [
  {
    nombre: "Que Gane El Mejor",
    tipo: "TV Perú · Concurso",
    img: "/clientes/que-gane-el-mejor.jpg",
    url: "https://www.tvperu.gob.pe/programas/que-gane-el-mejor",
  },
  {
    nombre: "Pukllaspa Yachay",
    tipo: "TV Perú · Educativo",
    img: "/clientes/pukllaspa-yachay.jpg",
    url: "https://www.tvperu.gob.pe/programas/pukllaspa-yachay",
  },
  {
    nombre: "Más Conectados",
    tipo: "TV Perú · Actualidad",
    img: "/clientes/mas-conectados.jpg",
    url: "https://www.tvperu.gob.pe/programas/mas-conectados",
  },
];

const servicios = [
  {
    icon: Signal,
    estado: "DISPONIBLE",
    title: "Emisión en pantalla",
    description:
      "El juego se renderiza durante el vivo, con la identidad del programa. Lo que tu equipo cargó en el Colector aparece en pantalla, en orden y a tiempo.",
  },
  {
    icon: Zap,
    estado: "DISPONIBLE",
    title: "Acelera tu producción",
    description:
      "Menos trabajo manual antes del aire. Armar, ordenar y revisar el contenido del juego deja de tomar horas: tu equipo llega al vivo con todo listo y con tiempo de sobra.",
  },
];

const pasos = [
  {
    n: "01",
    title: "Prepara",
    description:
      "Tu equipo entra a su espacio y carga el contenido del juego en el Colector. Se pega desde la planilla y queda listo antes de grabar.",
  },
  {
    n: "02",
    title: "Emite",
    description:
      "En el vivo, el juego se muestra en pantalla con la marca del programa. El operador avanza y todo aparece en orden, sin improvisar.",
  },
  {
    n: "03",
    title: "Interactúa",
    description:
      "La audiencia vota y participa desde casa. Los conductores ven el resultado en su tablero y el programa reacciona en tiempo real.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let panel: string | null = null;
  if (user) {
    if (await isPlatformAdmin()) {
      panel = "/admin";
    } else if ((await listPrograms()).length > 0) {
      panel = "/programs";
    }
  }
  const sinPrograma = Boolean(user) && panel === null;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150">
        <div className={`${CONTAINER} flex h-[68px] items-center gap-5`}>
          <Link href="#top" className="text-foreground">
            <RondaLogo markClassName="size-[30px]" />
          </Link>
          <nav className="ml-4 flex items-center gap-7 text-[15px] font-medium max-[900px]:hidden">
            <a href="#servicios" className="text-muted-foreground">
              Qué hacemos
            </a>
            <a href="#como" className="text-muted-foreground">
              Cómo funciona
            </a>
            <a href="#nosotros" className="text-muted-foreground">
              Quiénes somos
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <ThemeToggle />
            {panel ? (
              <Button
                className="h-10 px-4 text-[15px]"
                render={<Link href={panel} />}
              >
                Ir al panel <ArrowRight />
              </Button>
            ) : (
              <Button
                className="h-10 px-[18px] text-[15px] font-semibold"
                render={<a href="#contacto" />}
              >
                Solicitar reunión
              </Button>
            )}
            <AuthButton className="max-[620px]:px-2.5 [&>span]:max-[620px]:hidden" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <span id="top" />

        <section className="overflow-hidden border-b border-border">
          <div
            className={`${CONTAINER} grid grid-cols-[1.05fr_0.95fr] items-center gap-[clamp(36px,5vw,72px)] py-[clamp(56px,8vw,104px)] max-[900px]:grid-cols-1`}
          >
            <div>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[13.5px] font-semibold text-secondary-foreground">
                <span className="size-2 rounded-full bg-accent shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent)_22%,transparent)]" />
                Al aire en TV Perú
              </div>
              <h1 className="font-heading mb-[22px] text-[clamp(40px,5.4vw,62px)] font-semibold leading-[1.04] tracking-[-0.025em] text-balance">
                El área digital de tu programa de televisión.
              </h1>
              <p className="mb-8 max-w-[30em] text-[clamp(17px,1.5vw,20px)] leading-[1.6] text-muted-foreground">
                Cargas los datos del juego, sale al aire y tu equipo lo maneja
                sin complicaciones. Ronda es el software que tu producción
                necesita para salir en vivo, todo en un mismo lugar.
              </p>
              <div className="mb-[30px] flex flex-wrap gap-3">
                <Button
                  className="h-[52px] gap-2.5 px-6 text-[16.5px] font-semibold"
                  render={<a href="#contacto" />}
                >
                  Pedir una reunión
                  <ArrowRight className="size-[18px]" />
                </Button>
                <Button
                  variant="outline"
                  className="h-[52px] px-6 text-[16.5px] font-semibold"
                  render={<a href="#servicios" />}
                >
                  Ver qué hacemos
                </Button>
              </div>
              <p className="flex items-center gap-2.5 text-[14.5px] text-muted-foreground">
                <Check className="size-[18px] shrink-0 text-primary" />
                Sin instalaciones ni capacitación: tu equipo entra y trabaja.
              </p>
            </div>

            <div className="flex min-h-[420px] flex-col justify-between rounded-[calc(var(--radius)*1.8)] border border-border bg-[linear-gradient(150deg,color-mix(in_oklch,var(--primary)_12%,var(--card)),var(--card)_62%)] p-[26px] shadow-[0_30px_60px_-30px_color-mix(in_oklch,var(--primary)_40%,transparent)] max-[900px]:order-first max-[900px]:min-h-[260px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[12.5px] font-bold tracking-[0.02em] text-accent-foreground">
                  <span className="size-[7px] rounded-full bg-current" /> EN VIVO
                </span>
                <span className="text-[13px] font-semibold text-muted-foreground">
                  Tu programa, en el aire
                </span>
              </div>

              <div className="flex flex-col items-center gap-5 py-1.5">
                <svg
                  width="118"
                  height="118"
                  viewBox="0 0 132 132"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    cx="66"
                    cy="66"
                    r="52"
                    stroke="var(--border)"
                    strokeWidth="2"
                  />
                  <path
                    d="M66 14 A 52 52 0 0 1 118 66"
                    stroke="var(--primary)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="origin-[66px_66px] animate-[ronda-spin_6s_linear_infinite]"
                  />
                  <circle
                    cx="66"
                    cy="14"
                    r="7"
                    fill="var(--accent)"
                    className="origin-[66px_66px] animate-[ronda-spin_6s_linear_infinite]"
                  />
                  <path
                    d="M53 66 l9 9 17 -20"
                    stroke="var(--primary)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="flex w-full flex-col gap-2.5">
                  <div className="flex items-start gap-3 rounded-lg border border-[color-mix(in_oklch,var(--primary)_40%,var(--border))] bg-[color-mix(in_oklch,var(--primary)_10%,var(--card))] px-4 py-3.5">
                    <Check className="mt-px size-[19px] shrink-0 text-primary" />
                    <span className="text-[14.5px] font-semibold leading-[1.35]">
                      Trabajamos contigo, a medida de tus requerimientos.
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                    <span className="mr-0.5 text-[12.5px] font-bold tracking-[0.03em] text-muted-foreground">
                      INCLUYE
                    </span>
                    {["Colector", "Emisión", "y lo que pidas"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2.5 py-[3px] text-[12.5px] font-semibold text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-center text-[12.5px] text-muted-foreground">
                Un servicio con experiencia detrás de tu programa.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-secondary">
          <div className={`${CONTAINER} py-[clamp(56px,7vw,88px)]`}>
            <div className="mb-10 max-w-[47rem]">
              <p className={EYEBROW}>Clientes al aire</p>
              <h2 className={`${H2} mb-4`}>
                Programas que ya confían en Ronda.
              </h2>
              <p className="text-lg leading-[1.6] text-muted-foreground">
                Tres producciones de TV Perú ya salen al aire con Ronda,
                temporada tras temporada. No es una promesa a futuro: ya está
                funcionando.
              </p>
            </div>
            <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
              {clientes.map(({ nombre, tipo, img, url }) => (
                <a
                  key={nombre}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col overflow-hidden rounded-[calc(var(--radius)*1.3)] border border-border bg-card transition-colors hover:border-primary"
                >
                  <div className="relative h-[150px] border-b border-border bg-[color-mix(in_oklch,var(--foreground)_4%,var(--card))]">
                    <Image
                      unoptimized
                      loading="eager"
                      src={img}
                      alt={`Logo de ${nombre}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 380px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 px-[22px] py-5">
                    <span>
                      <span className="block text-base font-bold group-hover:text-primary">
                        {nombre}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] font-semibold text-muted-foreground">
                        {tipo}
                      </span>
                    </span>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </a>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Pronto cada programa tendrá su propia página dentro de Ronda. El
              siguiente puede ser el tuyo.
            </p>
          </div>
        </section>

        <section
          id="servicios"
          className="scroll-mt-20 border-b border-border"
        >
          <div className={`${CONTAINER} ${SECTION_Y}`}>
            <div className="mb-12 max-w-[44rem]">
              <p className={EYEBROW}>Qué hacemos</p>
              <h2 className={`${H2} mb-[18px]`}>
                Todo lo que tu programa necesita en software, sobre un mismo
                espacio.
              </h2>
              <p className="text-lg leading-[1.6] text-muted-foreground">
                No vendemos un juego suelto. Somos el proveedor digital del
                programa: hoy resolvemos los juegos interactivos, y el catálogo
                crece con lo que tu producción pida.
              </p>
            </div>
            <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              <div className="flex flex-col rounded-[calc(var(--radius)*1.3)] bg-primary p-[30px] text-primary-foreground">
                <span
                  className={`${PILL} inline-flex items-center gap-2 bg-[color-mix(in_oklch,var(--primary-foreground)_18%,transparent)] mb-[22px]`}
                >
                  <span className="size-[7px] rounded-full bg-accent" /> EN
                  PRODUCCIÓN
                </span>
                <ClipboardList className="mb-4 size-[30px]" strokeWidth={1.9} />
                <h3 className="font-heading mb-2.5 text-[25px] font-semibold">
                  Colector
                </h3>
                <p className="text-[15.5px] leading-[1.55] text-[color-mix(in_oklch,var(--primary-foreground)_88%,transparent)]">
                  La producción carga los datos del juego antes del aire: las
                  palabras de un deletreo, las preguntas de una ronda, las fotos
                  de un álbum. Editor a medida por juego y carga rápida pegando
                  desde tu planilla.
                </p>
              </div>

              {servicios.map(({ icon: Icon, estado, title, description }) => (
                <div key={title} className={`${CARD} flex flex-col`}>
                  <span
                    className={`${PILL} mb-[22px] bg-secondary text-secondary-foreground`}
                  >
                    {estado}
                  </span>
                  <Icon
                    className="mb-4 size-[30px] text-primary"
                    strokeWidth={1.9}
                  />
                  <h3 className="font-heading mb-2.5 text-[25px] font-semibold">
                    {title}
                  </h3>
                  <p className="text-[15.5px] leading-[1.55] text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}

              <div className="flex flex-col rounded-[calc(var(--radius)*1.3)] border border-dashed border-border bg-secondary p-[30px]">
                <span
                  className={`${PILL} mb-[22px] border border-border bg-card text-muted-foreground`}
                >
                  A MEDIDA
                </span>
                <Layers className="mb-4 size-[30px] text-primary" strokeWidth={1.9} />
                <h3 className="font-heading mb-2.5 text-[25px] font-semibold">
                  Y lo que tu programa pida
                </h3>
                <p className="text-[15.5px] leading-[1.55] text-muted-foreground">
                  Almacenamiento compartido, apoyo a conductores, herramientas
                  puntuales. Sumar un servicio no es empezar de cero: tu espacio
                  ya está, le agregamos lo que falte.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="como"
          className="scroll-mt-20 border-b border-border bg-secondary"
        >
          <div className={`${CONTAINER} ${SECTION_Y}`}>
            <div className="mb-12 max-w-[44rem]">
              <p className={EYEBROW}>Cómo funciona</p>
              <h2 className={H2}>
                Tres pasos, del escritorio de producción al aire.
              </h2>
            </div>
            <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {pasos.map(({ n, title, description }) => (
                <div key={n} className={`${CARD} flex flex-col gap-4`}>
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-[30px] font-semibold leading-none text-primary">
                      {n}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-[15.5px] leading-[1.55] text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="nosotros"
          className="scroll-mt-20 border-b border-border"
        >
          <div
            className={`${CONTAINER} ${SECTION_Y} grid grid-cols-2 items-center gap-[clamp(36px,5vw,72px)] max-[900px]:grid-cols-1`}
          >
            <div>
              <p className={EYEBROW}>Quiénes somos</p>
              <h2 className={`${H2} mb-5`}>
                Trato directo con quien construye Ronda.
              </h2>
              <p className="mb-4 text-lg leading-[1.65] text-muted-foreground">
                Ronda no es una agencia con capas de intermediarios. La
                construyo yo, desde Lima, trabajando pegado a la producción: sé
                que en el vivo no hay segunda toma y que una caída no es una
                opción.
              </p>
              <p className="text-lg leading-[1.65] text-muted-foreground">
                Por eso hablas directo conmigo, no con un ticket de soporte.
                Cuando algo se necesita para el aire de esta semana, del otro
                lado hay alguien que conoce tu programa por su nombre y lo
                resuelve.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[calc(var(--radius)*1.3)] border border-border bg-card p-[26px]">
                <div className="font-heading text-[40px] font-semibold leading-none text-primary">
                  3
                </div>
                <p className="mt-2.5 text-[14.5px] leading-[1.45] text-muted-foreground">
                  programas de TV Perú ya salen al aire con Ronda.
                </p>
              </div>
              <div className="rounded-[calc(var(--radius)*1.3)] border border-border bg-card p-[26px]">
                <div className="font-heading text-[40px] font-semibold leading-none text-primary">
                  0
                </div>
                <p className="mt-2.5 text-[14.5px] leading-[1.45] text-muted-foreground">
                  capacitaciones necesarias: tu equipo entra y trabaja.
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-4 rounded-[calc(var(--radius)*1.3)] border border-border bg-secondary px-[26px] py-6">
                <ShieldCheck
                  className="size-[30px] shrink-0 text-primary"
                  strokeWidth={1.9}
                />
                <p className="text-[15px] font-semibold leading-[1.4]">
                  Cada programa tiene su propio espacio, aislado y con sus
                  datos. Lo tuyo es tuyo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="contacto"
          className="scroll-mt-20 bg-primary text-primary-foreground"
        >
          <div
            className={`${CONTAINER} ${SECTION_Y} grid grid-cols-2 items-start gap-[clamp(36px,5vw,72px)] max-[900px]:grid-cols-1`}
          >
            <div>
              <p className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-accent brightness-125">
                Contacto
              </p>
              <h2 className="font-heading mb-[18px] text-[clamp(30px,3.6vw,46px)] font-semibold leading-[1.08] tracking-[-0.02em]">
                Cuéntame de tu programa y yo armo tu espacio.
              </h2>
              <p className="mb-[30px] text-lg leading-[1.6] text-[color-mix(in_oklch,var(--primary-foreground)_85%,transparent)]">
                Nada de registros ni formularios eternos. Escríbeme, coordinamos
                una llamada corta y entiendo qué necesita tu producción para el
                aire.
              </p>
              <div className="flex flex-col gap-3.5 text-base font-medium">
                <a
                  href="mailto:esteban.abanto.2709@gmail.com"
                  className="flex items-center gap-3"
                >
                  <Mail className="size-5" />
                  esteban.abanto.2709@gmail.com
                </a>
                <p className="flex items-center gap-3">
                  <Phone className="size-5" />
                  Lima, Perú · Te respondo el mismo día
                </p>
              </div>
            </div>

            <div className="rounded-[calc(var(--radius)*1.4)] bg-card p-[clamp(26px,3vw,36px)] text-card-foreground shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]">
              {sinPrograma ? (
                <>
                  <h3 className="font-heading mb-1.5 text-2xl font-semibold">
                    Solicita tu espacio
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Tu cuenta aún no tiene un programa asignado. Cuéntanos qué
                    produces y coordinamos una reunión.
                  </p>
                  <InquiryForm
                    action={sendInquiryAction}
                    email={user?.email ?? ""}
                  />
                </>
              ) : panel ? (
                <>
                  <h3 className="font-heading mb-1.5 text-2xl font-semibold">
                    Tu espacio ya está listo
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Entra al panel para trabajar con los servicios de tu
                    programa.
                  </p>
                  <Button
                    className="h-[52px] w-full gap-2.5 text-[16.5px] font-semibold"
                    render={<Link href={panel} />}
                  >
                    Ir al panel <ArrowRight className="size-[18px]" />
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-heading mb-1.5 text-2xl font-semibold">
                    Escríbeme sobre tu programa
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Ingresa con tu cuenta de Google y cuéntame qué produces y
                    qué quieres resolver en el aire. Te respondo el mismo día.
                  </p>
                  <AuthButton className="h-[52px] w-full text-[16.5px] font-semibold" />
                  <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
                    Te escribo solo para coordinar tu programa. Sin listas de
                    correo ni spam.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div
          className={`${CONTAINER} flex flex-wrap items-start justify-between gap-[30px] pt-12 pb-9`}
        >
          <div className="max-w-[22rem]">
            <RondaLogo
              className="mb-3.5"
              markClassName="size-[26px]"
              wordClassName="text-xl"
            />
            <p className="text-[14.5px] leading-[1.55] text-muted-foreground">
              El área digital de tu programa de televisión. Hecho en Lima, para
              la televisión peruana.
            </p>
          </div>
          <div className="flex flex-wrap gap-[clamp(40px,6vw,80px)]">
            <div className="flex flex-col gap-2.5">
              <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Producto
              </span>
              <a href="#servicios" className="text-[14.5px]">
                Qué hacemos
              </a>
              <a href="#como" className="text-[14.5px]">
                Cómo funciona
              </a>
              <a href="#contacto" className="text-[14.5px]">
                Contacto
              </a>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Ronda
              </span>
              <a href="#nosotros" className="text-[14.5px]">
                Quiénes somos
              </a>
              {panel && (
                <Link href={panel} className="text-[14.5px]">
                  Ir al panel
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div
            className={`${CONTAINER} flex flex-wrap justify-between gap-3 py-5 text-[13px] text-muted-foreground`}
          >
            <span className="flex items-center gap-2">
              <RondaMark className="size-4" />
              BroadStream Coders © 2026 · Todos los derechos reservados.
            </span>
            <span>Hecho en Perú para la televisión peruana.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
