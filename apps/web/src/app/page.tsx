import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <Badge variant="secondary">
            <Sparkles /> shadcn/ui integrado
          </Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Ronda
          </h1>
          <p className="text-muted-foreground">
            Plataforma de juegos para programas de TV en vivo.
          </p>
          <p className="text-xs text-muted-foreground">
            Nombre provisional · en construcción
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Componentes en uso</CardTitle>
            <CardDescription>
              Todo lo de abajo son componentes de shadcn/ui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="programa">Programa</Label>
              <Input id="programa" placeholder="Ej. Que Gane el Mejor" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button>
                Entrar <ArrowRight />
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Badge variant="outline">Next.js 16</Badge>
            <Badge variant="outline">Tailwind v4</Badge>
            <Badge variant="outline">Base UI</Badge>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
