import { createClient } from "./supabase/server";

export type PingResult = { ok: boolean; message: string };

export async function ping(): Promise<PingResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      ok: false,
      message:
        "Supabase no configurado: faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("__ping__").select("*").limit(1);

  if (!error || error.code === "PGRST205") {
    return { ok: true, message: "Conexión con Supabase OK" };
  }

  return { ok: false, message: error.message };
}
