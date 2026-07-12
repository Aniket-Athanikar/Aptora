"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="text-center px-6">
        <h1 className="text-6xl font-black text-red-200 mb-4">Oops!</h1>
        <h2 className="text-2xl font-bold text-neutral-800 mb-3">
          Something went wrong
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D4AFF] text-white font-semibold rounded-xl hover:bg-[#5B3DE0] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
