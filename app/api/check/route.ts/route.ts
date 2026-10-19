import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { address } = await req.json();

  if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? "")) {
    return NextResponse.json({ error: "Alamat tidak valid" }, { status: 400 });
  }

  // Jika model sudah di-host, teruskan ke sana
  if (process.env.MODEL_API_URL) {
    const res = await fetch(process.env.MODEL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (!res.ok) return NextResponse.json({ error: "Model gagal merespons" }, { status: 502 });
    return NextResponse.json(await res.json());
  }

  // Sementara: data dummy supaya UI bisa dites
  return NextResponse.json({ label: "non-scam", probability: 0.5 });
}