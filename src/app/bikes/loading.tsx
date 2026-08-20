export default function BikesLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="loading-heading"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <h1 id="loading-heading" className="sr-only">
        Loading bikes
      </h1>

      <div className="mb-10 h-32 max-w-3xl animate-pulse rounded-2xl bg-zinc-200" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-3xl bg-zinc-200"
          />
        ))}
      </div>
    </section>
  );
}
