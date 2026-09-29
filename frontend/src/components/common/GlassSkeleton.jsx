export default function GlassSkeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-white/10 dark:bg-slate-900/20 border border-white/10 rounded-xl ${className}`}
    />
  );
}
