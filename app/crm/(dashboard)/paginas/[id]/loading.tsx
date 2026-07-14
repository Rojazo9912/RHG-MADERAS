export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-28 rounded bg-brown-dark/10" />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="h-7 w-40 rounded bg-brown-dark/10" />
          <div className="mt-2 h-3 w-20 rounded bg-brown-dark/5" />
        </div>
        <div className="h-6 w-20 rounded-full bg-brown-dark/10" />
      </div>
      <div className="mt-6 grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-brown-dark/10 bg-white" />
          ))}
        </div>
        <div className="h-[60vh] rounded-xl border border-brown-dark/10 bg-white" />
      </div>
    </div>
  );
}
