"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const BACKGROUND_IMAGES: string[] = [
  "/images/pastorBilly.jpg",
  "/images/phil.jpg",
  "/images/ruthjoy.jpg",
  "/images/Osas.jpg",
  "/images/sisMercy.jpg",
  "/images/sisterSingers.jpg",
  "/images/img2021camp52.jpg",
  "/images/img2021camp53.jpg",
  "/images/img2021camp54.jpg"
];

const PortalLogin: React.FC = () => {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setBgIndex((p) => (p + 1) % BACKGROUND_IMAGES.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="w-full md:w-2/3 min-h-screen flex flex-col p-6 md:p-12 bg-linear-to-t from-green-700 via-white to-blue-500">
        <AuthHeader />
        <div className="w-full h-px bg-gray-200 my-6" />
        <main className="flex flex-col flex-1 justify-center max-w-xl mx-auto w-full">
          <LoginTitle />
          <LoginCard />
        </main>
      </div>

      <div className="hidden md:block md:w-1/3 relative overflow-hidden">
        {BACKGROUND_IMAGES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`camp ${i + 1}`}
            fill
            priority={i === 0}
            className={`object-cover transition-opacity duration-[1200ms] ${
              i === bgIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/60" />
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
          <div className="max-w-xs">
            <h2 className="text-3xl font-bold">Welcome Back!</h2>
            <p className="mt-3 opacity-90 text-sm">
              Log in to manage bedspace allocations and registrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;

/* ---------------- COMPONENTS ---------------- */

const AuthHeader: React.FC = () => (
  <header className="flex items-center justify-between font-[lexend]">
    <div className="flex items-center gap-3">
      <div className="rounded-md bg-white p-2 shadow-sm">
        <Image
          src="/images/gcftLogo.png"
          alt="gcftLogo"
          width={60}
          height={60}
          className="bg-white rounded-md object-cover"
        />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold bg-linear-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
          GCFT <span className="text-white">-</span> CHURCH
        </h1>
        <p className="text-sm text-gray-500 font-bold">
          PORTAL
        </p>
      </div>
    </div>
  </header>
);

const LoginTitle: React.FC = () => (
  <div className="mb-6 font-[lexend]">
    <h2 className="text-3xl font-extrabold bg-linear-to-r from-green-700 to-lime-400 bg-clip-text text-transparent">
      GCFT PORTAL LOGIN
    </h2>
    <p className="mt-2 text-sm text-gray-600">
      Enter Administrative credentials to continue.
    </p>
  </div>
);

const LoginCard: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/portal/dashboard");
    } else {
      const data = await res.json();
      setError(data.message || "Invalid login credentials");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 font-[lexend]">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* EMAIL */}
        <div>
          <label className="text-xs mb-2 block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="text-xs mb-2 block text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="w-1/2 bg-linear-to-r from-green-700 to-lime-400 text-white rounded-full py-3 font-semibold 
            hover:bg-green-800 transition text-center"
          >
            Back Home
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-linear-to-l from-green-700 to-blue-300 text-white rounded-full py-3 font-semibold 
            hover:bg-green-800 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
};