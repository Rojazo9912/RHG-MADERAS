export default function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 rounded bg-brown-dark/10" />
      <div className="mt-2 h-4 w-64 rounded bg-brown-dark/5" />

      <div className="mt-6 overflow-hidden rounded-lg border border-brown-dark/10 bg-white">
        <div className="bg-brown-dark/5 px-4 py-3">
          <div className="h-3 w-full max-w-md rounded bg-brown-dark/10" />
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-6 border-t border-brown-dark/5 px-4 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 flex-1 rounded bg-brown-dark/5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
