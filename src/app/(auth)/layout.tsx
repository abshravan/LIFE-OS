export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        {/* System header */}
        <div className="mb-8 text-center">
          <p className="text-xs tracking-[0.3em] text-[var(--sys-muted)] uppercase mb-2">
            SYSTEM INITIALIZE
          </p>
          <h1 className="text-2xl font-bold tracking-wider text-[var(--sys-cyan)] text-glow-cyan">
            LIFE<span className="text-[var(--sys-text)]">OS</span>
          </h1>
          <p className="text-xs text-[var(--sys-muted)] mt-1 tracking-widest">
            v1.0 · DISCIPLINE TRACKING SYSTEM
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
