import { NextResponse } from "next/server";

import { ping } from "@/data";

export async function GET() {
  const result = await ping();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
