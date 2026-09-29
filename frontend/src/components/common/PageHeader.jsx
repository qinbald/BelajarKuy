export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div className="flex flex-col gap-2">
        <h1 className="w-fit bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-5 py-1.5 rounded-full text-2xl font-extrabold text-slate-800 dark:text-white shadow-sm">
          {title}
        </h1>
        {subtitle && (
          <p className="w-fit bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
