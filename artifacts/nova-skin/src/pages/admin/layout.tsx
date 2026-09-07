import { ReactNode, useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetCurrentUser, useLogout } from '@workspace/api-client-react';
import { LayoutDashboard, Sparkles, Image as ImageIcon, Video, Tag, Users, MessageCircle, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useGetCurrentUser();
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loc] = useLocation();

  useEffect(() => {
    if (isError) {
      setLocation('/admin/login');
    }
  }, [isError, setLocation]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F2F2EF]"><p className="text-[#2F4055] text-sm tracking-widest uppercase font-bold">Cargando...</p></div>;
  }

  const nav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Servicios', path: '/admin/services', icon: Sparkles },
    { name: 'Galería', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Videos', path: '/admin/videos', icon: Video },
    { name: 'Promociones', path: '/admin/promotions', icon: Tag },
    { name: 'Especialistas', path: '/admin/specialists', icon: Users },
    { name: 'Testimonios', path: '/admin/testimonials', icon: MessageCircle },
    { name: 'Mensajes', path: '/admin/messages', icon: MessageSquare },
    { name: 'Ajustes', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => setLocation('/admin/login') });
  };

  return (
    <div className="flex min-h-screen bg-[#e6e1d9]">
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between bg-[#2F4055] px-4 text-white md:hidden fixed top-0 left-0 right-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#BB9445] font-serif text-lg text-[#BB9445]">N</span>
          <span className="text-xs font-bold tracking-[.2em] uppercase">ADMIN</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#2F4055] text-[#F2F2F0] transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block flex flex-col shadow-2xl md:shadow-none`}>
        <div className="hidden h-24 items-center justify-center border-b border-white/10 md:flex">
          <Link href="/admin" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#BB9445] font-serif text-xl text-[#BB9445]">N</span>
            <span className="text-xs font-bold tracking-[.2em] uppercase">NovaSkin ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto mt-16 md:mt-0">
          {nav.map(item => {
            const active = loc === item.path || (item.path !== '/admin' && loc.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors ${active ? 'bg-[#BB9445] text-white shadow-md' : 'text-[#bdc5c8] hover:bg-white/10 hover:text-white'}`}>
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 pb-8 md:pb-4">
          <div className="mb-4 px-3 text-xs text-[#bdc5c8] truncate">
            {user.email}
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#bdc5c8] transition-colors hover:bg-white/10 hover:text-white">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 mt-16 md:mt-0 overflow-y-auto relative">
        <div className="mx-auto max-w-6xl pb-20">
          {children}
        </div>
      </main>
      
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-[#2F4055]/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}