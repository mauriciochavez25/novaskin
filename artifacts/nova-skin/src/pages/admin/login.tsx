import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLogin } from '@workspace/api-client-react';
import { AdminButton, AdminInput } from '../../components/admin/ui';

export function Login() {
  const [, setLocation] = useLocation();
  const login = useLogin();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    login.mutate({
      data: { email: String(f.get('email')), password: String(f.get('password')) }
    }, {
      onSuccess: () => setLocation('/admin'),
      onError: () => setError('Credenciales incorrectas')
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F2EF] p-4 relative overflow-hidden">
      {/* Decorative background grain (reusing public site style) */}
      <div className="nova-grain absolute inset-0"></div>
      
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl relative z-10 border border-[#AF9275]/20">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#BB9445] font-serif text-2xl text-[#BB9445]">N</div>
          <h1 className="font-serif text-3xl text-[#2F4055]">Acceso</h1>
          <p className="mt-2 text-sm text-[#68727b] uppercase tracking-widest">Área Administrativa</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AdminInput label="Correo Electrónico" name="email" type="email" autoComplete="username" required />
          <AdminInput label="Contraseña" name="password" type="password" autoComplete="current-password" required />
          {error && <p className="text-sm text-[#A83525] bg-[#A83525]/10 p-3 rounded-md border border-[#A83525]/20">{error}</p>}
          <AdminButton type="submit" variant="gold" className="w-full py-3" disabled={login.isPending}>
            {login.isPending ? 'Iniciando...' : 'Entrar al Dashboard'}
          </AdminButton>
        </form>
      </div>
    </div>
  );
}