export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <h1 className="text-2xl font-bold">Sin conexión</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-600">
        No pudimos cargar la página porque no hay conexión a internet. Reintentá cuando vuelvas a estar online.
      </p>
    </main>
  );
}
