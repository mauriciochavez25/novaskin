import { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F4055]/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-[#F2F2EF] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#2F4055]">{title}</h2>
          <button type="button" onClick={onClose} className="text-[#68727b] hover:text-[#2F4055]"><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminButton({ children, variant = 'primary', className = '', ...props }: any) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants: any = {
    primary: "bg-[#2F4055] text-white hover:bg-[#3d526b]",
    gold: "bg-[#BB9445] text-white hover:bg-[#cba657]",
    outline: "border border-[#AF9275] text-[#2F4055] hover:bg-[#e6e1d9]",
    danger: "bg-[#A83525] text-white hover:bg-[#8a2a1d]"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function AdminInput({ label, error, className = '', ...props }: any) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-[#68727b]">{label}</label>}
      <input className="rounded-md border border-[#AF9275]/50 bg-white px-3 py-2 text-sm text-[#2F4055] focus:border-[#BB9445] focus:outline-none focus:ring-1 focus:ring-[#BB9445]" {...props} />
      {error && <span className="text-xs text-[#A83525]">{error}</span>}
    </div>
  );
}

export function AdminTextarea({ label, error, className = '', ...props }: any) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-[#68727b]">{label}</label>}
      <textarea className="rounded-md border border-[#AF9275]/50 bg-white px-3 py-2 text-sm text-[#2F4055] min-h-24 focus:border-[#BB9445] focus:outline-none focus:ring-1 focus:ring-[#BB9445]" {...props} />
      {error && <span className="text-xs text-[#A83525]">{error}</span>}
    </div>
  );
}

export function AdminSwitch({ checked, onChange, label, name }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-[#BB9445]' : 'bg-[#AF9275]/40'}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
      </div>
      {label && <span className="text-sm font-medium text-[#2F4055]">{label}</span>}
      <input type="checkbox" name={name} className="sr-only" checked={checked} onChange={e => onChange?.(e.target.checked)} />
    </label>
  );
}

export function PageHeader({ title, description, action }: any) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="font-serif text-3xl text-[#2F4055]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#68727b]">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}