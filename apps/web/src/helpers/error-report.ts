const MAX_CAUSES = 5;

function describe(error: unknown, depth = 0): string[] {
  if (!(error instanceof Error)) return [String(error)];

  const head = `${error.name}: ${error.message}`;
  const stack = error.stack ?? "";
  const lines = [stack.startsWith(head) ? stack : `${head}\n${stack}`.trim()];

  if (error.cause !== undefined && depth < MAX_CAUSES) {
    lines.push("", "Causa:", ...describe(error.cause, depth + 1));
  }
  return lines;
}

export function formatErrorReport(title: string, error: unknown): string {
  return [
    `Aviso: ${title}`,
    `Hora: ${new Date().toLocaleString("es-PE")}`,
    `Página: ${window.location.href}`,
    `Navegador: ${navigator.userAgent}`,
    "",
    ...describe(error),
  ].join("\n");
}
