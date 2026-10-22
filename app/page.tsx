"use client";
import { useState } from "react";

type Result = { label: "scam" | "non-scam"; probability: number };

const features = [
  { title: "Deteksi Cepat", desc: "Analisis token secara real-time dengan akurasi tinggi menggunakan machine learning" },
  { title: "XGBoost Algorithm", desc: "Menggunakan algoritma XGBoost untuk klasifikasi token scam dan non-scam" },
  { title: "Aman & Terpercaya", desc: "Melindungi investasi Anda dari token scam dengan analisis mendalam" },
];

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const valid = /^0x[a-fA-F0-9]{40}$/.test(address);

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memeriksa token");
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white text-slate-900">
      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-white">🛡</span>
            ScamGuard
          </div>
          <nav className="hidden gap-8 text-sm text-slate-600 md:flex">
            <a href="#">Beranda</a>
            <a href="#fitur">Fitur</a>
            <a href="#">Tentang</a>
            <a href="#">Kontak</a>
          </nav>
          <div className="w-8" />
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-3xl px-6 pt-10 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Deteksi Token Scam</h1>
        <p className="mt-4 text-slate-600">
          Sistem berbasis AI untuk mendeteksi token scam pada ekosistem Ethereum Virtual Machine (EVM) menggunakan metode XGBoost
        </p>

        {/* Form */}
        <div className="mt-8 rounded-xl bg-white p-6 text-left shadow-md">
          <h2 className="text-xl font-semibold">Periksa Token</h2>
          <p className="mt-1 text-sm text-slate-600">
            Masukkan alamat kontrak token untuk memeriksa 
          </p>
          <label className="mt-5 block text-xs font-medium">Alamat Kontrak Token</label>
          <div className="mt-2 flex gap-2">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              placeholder="0x..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-red-400"
            />
            <button
              onClick={handleCheck}
              disabled={!valid || loading}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Memeriksa..." : "Periksa"}
            </button>
          </div>
          {address && !valid && (
            <p className="mt-2 text-xs text-red-600">Format alamat tidak valid (harus 0x + 40 karakter hex)</p>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {result && (
            <div
              className={`mt-4 rounded-lg p-4 text-sm ${
                result.label === "scam" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              <b>{result.label === "scam" ? "⚠️ Terindikasi SCAM" : "✅ Terindikasi aman (non-scam)"}</b>
              <div>Tingkat keyakinan model: {(result.probability * 100).toFixed(1)}%</div>
            </div>
          )}
        </div>
      </main>

      {/* Fitur */}
      <section id="fitur" className="mx-auto mt-10 grid max-w-5xl gap-5 px-6 pb-16 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-red-100 text-red-600">●</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}