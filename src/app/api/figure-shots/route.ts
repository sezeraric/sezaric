import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/** Dev-only sink for the figure render rig: writes PNGs into public/figure. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "development only" }, { status: 404 });
  }
  const { name, dataUrl } = (await request.json()) as { name: string; dataUrl: string };
  if (!/^[a-z0-9-]+\.png$/.test(name)) {
    return NextResponse.json({ error: "bad name" }, { status: 400 });
  }
  const dir = path.join(process.cwd(), "public", "figure");
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(dataUrl.split(",")[1], "base64");
  await writeFile(path.join(dir, name), bytes);
  return NextResponse.json({ ok: true, bytes: bytes.length });
}
