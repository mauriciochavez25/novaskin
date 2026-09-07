import { useGetAdminSummary } from '@workspace/api-client-react';
import { PageHeader } from '../../components/admin/ui';
import { Image, Video, Sparkles, Tag, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';

export function Dashboard() {
  const { data: summary, isLoading } = useGetAdminSummary();

  if (isLoading) return <p className="text-[#68727b] font-medium">Cargando resumen...</p>;

  const cards = summary ? [
    { label: 'Servicios', value: summary.services, icon: Sparkles, link: '/admin/services' },
    { label: 'Promociones', value: summary.promotions, icon: Tag, link: '/admin/promotions' },
    { label: 'Galería', value: summary.images, icon: Image, link: '/admin/gallery' },
    { label: 'Videos', value: summary.videos, icon: Video, link: '/admin/videos' },
    { label: 'Mensajes Totales', value: summary.messages, icon: MessageSquare, link: '/admin/messages' },
    { label: 'Mensajes No Leídos', value: summary.unreadMessages, icon: MessageSquare, link: '/admin/messages', alert: summary.unreadMessages > 0 },
  ] : [];

  return (
    <div>
      <PageHeader title="Bienvenida" description="Resumen de la actividad en NovaSkin." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Link key={i} href={c.link} className={`block rounded-xl bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg border ${c.alert ? 'border-[#A83525]/30 shadow-[#A83525]/10' : 'border-[#AF9275]/20 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#68727b]">{c.label}</p>
                <p className={`mt-2 font-serif text-4xl ${c.alert ? 'text-[#A83525]' : 'text-[#2F4055]'}`}>{c.value}</p>
              </div>
              <div className={`rounded-full p-4 ${c.alert ? 'bg-[#A83525]/10 text-[#A83525]' : 'bg-[#e6e1d9] text-[#BB9445]'}`}>
                <c.icon size={26} strokeWidth={1.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {(summary?.unreadMessages ?? 0) > 0 && (
        <div className="mt-8 rounded-xl bg-[#A83525]/10 p-6 border border-[#A83525]/20 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-[#A83525]">Tienes {summary?.unreadMessages} mensajes sin leer</h3>
            <p className="text-sm text-[#A83525]/80 mt-1">Revisa la bandeja de entrada para atender a los clientes.</p>
          </div>
          <Link href="/admin/messages" className="inline-flex items-center gap-2 rounded-md bg-[#A83525] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8a2a1d]">
            Ir a Mensajes
          </Link>
        </div>
      )}
    </div>
  );
}