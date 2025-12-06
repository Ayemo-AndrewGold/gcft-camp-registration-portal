"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const BACKGROUND_IMAGES: string[] = [
  "/images/img2021camp1.jpg",
  "/images/img2021camp2.jpg",
  "/images/img2021camp3.jpg",
  "/images/img2021camp4.jpg",
  "/images/img2021camp5.jpg",
  "/images/img2021camp6.jpg",
  "/images/img2021camp7.jpg",
  "/images/img2021camp8.jpg",
  "/images/img2021camp9.jpg",
  "/images/img2021camp10.jpg",
  "/images/img2021camp11.jpg",
];

interface ErrorState {
  email?: string;
  password?: string;
}

const AdminLoginPage: React.FC = () => {
  const [bgIndex, setBgIndex] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => {
      setBgIndex((p) => (p + 1) % BACKGROUND_IMAGES.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-2/3 flex flex-col p-6 md:p-12 bg-linear-to-t from-green-700 via-white to-lime-400">
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

export default AdminLoginPage;

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
        <h1 className="text-2xl font-extrabold text-gray-900 text-green-900">
          GCFT <span className="text-white">-</span> CHURCH
        </h1>
        <p className="text-sm text-gray-500 font-bold">Admin Portal</p>
      </div>
    </div>
  </header>
);

const LoginTitle: React.FC = () => (
  <div className="mb-6 font-[lexend]">
    <h2 className="text-3xl font-extrabold bg-linear-to-r from-green-700 to-lime-400 bg-clip-text text-transparent font-[lexend]">
      GCFT ADMINISTRATIVE LOGIN
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
  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const validate = useCallback((): boolean => {
    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      const issues: ErrorState = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0]) as keyof ErrorState;
        issues[key] = i.message;
      });
      setErrors(issues);
      return false;
    }

    setErrors({});
    return true;
  }, [email, password]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    
    if (!validate()) return;

    setLoading(true);

    try {
      // Call your login API route
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to dashboard - middleware will handle the rest
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setLoginError(data.error || "Invalid email or password");
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 font-[lexend]">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Error Alert */}
        {loginError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700">{loginError}</p>
          </div>
        )}

        {/* EMAIL */}
        <div>
          <label className="text-xs mb-2 block text-gray-700">Email</label>
          <input
            type="email"
            className={`w-full rounded-lg border px-4 py-3 text-sm bg-gray-50 ${
              errors.email ? "border-red-300" : "border-gray-200"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gcftcamp.com"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <label className="text-xs mb-2 block text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full rounded-lg border px-4 py-3 text-sm bg-gray-50 ${
                errors.password ? "border-red-300" : "border-gray-200"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* SUBMIT */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="w-1/2 bg-linear-to-r from-green-700 to-lime-400 text-white rounded-full py-3 font-semibold cursor-pointer 
            hover:bg-green-800 transition text-center font-[lexend]"
          >
            Back Home
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-linear-to-l from-green-700 to-lime-400 text-white rounded-full py-3 font-semibold cursor-pointer 
            hover:bg-green-800 transition disabled:opacity-50 flex items-center justify-center gap-2 font-[lexend]"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
};