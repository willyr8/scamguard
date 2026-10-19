import { NextResponse } from "next/server";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

async function sendMessage(chatId: number, text: string, siteUrl?: string) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };
  if (siteUrl) {
    body.reply_markup = {
      inline_keyboard: [[{ text: "🌐 Buka Website", url: siteUrl }]],
    };
  }
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function POST(req: Request) {
  // Pastikan request benar-benar dari Telegram
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json();
  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId: number = message.chat.id;
  const text: string = message.text.trim();
  const origin = new URL(req.url).origin;

  if (text.startsWith("/start")) {
    await sendMessage(
      chatId,
      "🛡 <b>Selamat datang di ScamGuard</b>\n\nKirim alamat kontrak token (diawali 0x) dan saya akan memeriksa apakah token tersebut scam atau bukan.",
      origin
    );
    return NextResponse.json({ ok: true });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(text)) {
    await sendMessage(
      chatId,
      "Format tidak valid. Kirim alamat kontrak token yang diawali <code>0x</code> dan berisi 40 karakter heksadesimal."
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(`${origin}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal memeriksa");

    const verdict =
      data.label === "scam" ? "⚠️ <b>Terindikasi SCAM</b>" : "✅ <b>Terindikasi aman (non-scam)</b>";
    await sendMessage(
      chatId,
      `${verdict}\nTingkat keyakinan model: ${(data.probability * 100).toFixed(1)}%\n\n<code>${text}</code>`
    );
  } catch {
    await sendMessage(chatId, "Maaf, terjadi kesalahan saat memeriksa token. Coba lagi nanti.");
  }

  return NextResponse.json({ ok: true });
}