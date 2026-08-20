export default function BikeDetailLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="loading-heading"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <h1 id="loading-heading" className="sr-only">
        Loading bike
      </h1>

      <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="mt-6 h-[30rem] animate-pulse rounded-3xl bg-zinc-200" />
    </section>
  );
}
