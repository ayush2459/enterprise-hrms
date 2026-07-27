export function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-ink-faint animate-fade-in">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-surface-sunken" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
      {label}
    </div>
  );
}
