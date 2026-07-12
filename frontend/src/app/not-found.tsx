"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="text-center px-6">
        <h1 className="text-8xl font-black text-neutral-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-neutral-800 mb-3">
          Page Not Found
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D4AFF] text-white font-semibold rounded-xl hover:bg-[#5B3DE0] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
