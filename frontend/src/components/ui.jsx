import { useEffect } from 'react';

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-sidebar text-white hover:bg-sidebar-hover',
    secondary: 'bg-surface text-ink border border-line hover:bg-paper',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-muted hover:bg-paper hover:text-ink',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition placeholder:text-muted/60 focus:border-brass focus:ring-1 focus:ring-brass ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none transition focus:border-brass focus:ring-1 focus:ring-brass ${className}`}
      {...props}
    />
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Card({ title, subtitle, action, className = '', bodyClassName = '', children }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-line bg-surface shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-line bg-paper/60 text-left text-xs font-medium uppercase tracking-wider text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.key ?? c.label} className={`px-5 py-3 ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted transition hover:bg-paper hover:text-ink"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-paper text-muted',
    red: 'bg-rose-100 text-rose-700',
    brass: 'bg-brass/15 text-brass',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
        isErr ? 'bg-rose-600' : 'bg-sidebar'
      }`}
      role="status"
    >
      {toast.text}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brass" />
    </div>
  );
}

export function EmptyState({ children }) {
  return <div className="px-5 py-16 text-center text-sm text-muted">{children}</div>;
}
