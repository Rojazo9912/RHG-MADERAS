export default function Loading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-4 w-24 rounded bg-brown-dark/10" />
      <div className="mt-4 rounded-lg border border-brown-dark/10 bg-white p-6">
        <div className="h-7 w-48 rounded bg-brown-dark/10" />
        <div className="mt-2 h-4 w-64 rounded bg-brown-dark/5" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-brown-dark/5" />
              <div className="h-4 w-32 rounded bg-brown-dark/10" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 h-40 rounded-lg border border-brown-dark/10 bg-white" />
    </div>
  );
}
