import { useListContactMessages, useUpdateContactMessage, useDeleteContactMessage, getListContactMessagesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/admin/ui';
import { Trash2, CheckCircle, Circle, Mail, Phone } from 'lucide-react';

export function Messages() {
  const { data: messages, isLoading } = useListContactMessages();
  const update = useUpdateContactMessage();
  const del = useDeleteContactMessage();
  const qc = useQueryClient();

  if (isLoading) return <p className="text-[#68727b] font-medium">Cargando mensajes...</p>;

  const toggleRead = (id: number, read: boolean) => {
    update.mutate({ id, data: { read } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListContactMessagesQueryKey() }) });
  };
  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar este mensaje permanentemente?')) {
      del.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListContactMessagesQueryKey() }) });
    }
  };

  return (
    <div>
      <PageHeader title="Mensajes" description="Bandeja de entrada de contacto." />
      <div className="space-y-5">
        {messages?.map(m => (
          <div key={m.id} className={`rounded-xl border p-6 transition-colors shadow-sm ${m.read ? 'border-[#AF9275]/20 bg-white' : 'border-[#BB9445]/40 bg-[#fbf9f6]'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-serif text-2xl text-[#2F4055] flex items-center gap-3">
                  {m.name} {!m.read && <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#A83525]"></span>}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#68727b]">
                  <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-[#BB9445] transition"><Mail size={15}/> {m.email}</a>
                  <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-[#BB9445] transition"><Phone size={15}/> {m.phone}</a>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto justify-end">
                <button onClick={() => toggleRead(m.id, !m.read)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${m.read ? 'text-[#68727b] hover:bg-[#e6e1d9]' : 'bg-[#2F4055] text-white hover:bg-[#3d526b]'}`} title={m.read ? 'Marcar como no leído' : 'Marcar como leído'}>
                  {m.read ? <><Circle size={16}/> Marcar no leído</> : <><CheckCircle size={16}/> Marcar leído</>}
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition"><Trash2 size={18}/></button>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-white/60 p-5 border border-[#AF9275]/10">
              <p className="text-[#2F4055] whitespace-pre-wrap leading-relaxed">{m.message}</p>
            </div>
            <p className="mt-4 text-xs font-bold text-[#AF9275] uppercase tracking-[.15em]">{new Date(m.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
        ))}
        {messages?.length === 0 && (
          <div className="rounded-xl border border-[#AF9275]/20 bg-white p-12 text-center shadow-sm">
            <CheckCircle size={40} className="mx-auto text-[#BB9445]/50 mb-4" />
            <p className="text-[#2F4055] font-serif text-xl">Bandeja al día</p>
            <p className="text-[#68727b] text-sm mt-2">No hay mensajes en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}