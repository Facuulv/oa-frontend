"use client";

export default function ConfiguracionCard({ title, description, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <header className="mb-4 border-b border-zinc-100 pb-3">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
