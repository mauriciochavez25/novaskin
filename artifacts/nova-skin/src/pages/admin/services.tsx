import { useState } from 'react';
import { useListServices, useCreateService, useUpdateService, useDeleteService, getListServicesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader, AdminButton, Modal, AdminInput, AdminTextarea, AdminSwitch } from '../../components/admin/ui';
import { Edit2, Trash2, Plus } from 'lucide-react';

export function Services() {
  const { data: services, isLoading } = useListServices();
  const create = useCreateService();
  const update = useUpdateService();
  const del = useDeleteService();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeToggle, setActiveToggle] = useState(true);

  const openNew = () => { setEditing(null); setActiveToggle(true); setModalOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setActiveToggle(s.active); setModalOpen(true); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get('name')),
      description: String(f.get('description')),
      price: f.get('price') ? Number(f.get('price')) : null,
      duration: f.get('duration') ? String(f.get('duration')) : null,
      imageUrl: String(f.get('imageUrl')),
      sortOrder: Number(f.get('sortOrder') || 0),
      active: activeToggle
    };

    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListServicesQueryKey() }); setModalOpen(false); } };
    
    if (editing) update.mutate({ id: editing.id, data: payload }, opt);
    else create.mutate({ data: payload }, opt);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este servicio?')) {
      del.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListServicesQueryKey() }) });
    }
  };

  if (isLoading) return <p className="text-[#68727b]">Cargando servicios...</p>;

  return (
    <div>
      <PageHeader title="Servicios" description="Administra los tratamientos ofrecidos." action={<AdminButton onClick={openNew}><Plus size={16}/> Nuevo Servicio</AdminButton>} />
      
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-[#AF9275]/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#e6e1d9] text-xs uppercase tracking-wider text-[#2F4055]">
            <tr>
              <th className="p-4">Servicio</th>
              <th className="p-4 hidden md:table-cell">Precio / Duración</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#AF9275]/20">
            {services?.map(s => (
              <tr key={s.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <img src={s.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover border border-[#AF9275]/20 bg-[#F2F2EF]" />
                    <div>
                      <p className="font-semibold text-[#2F4055]">{s.name}</p>
                      <p className="mt-0.5 text-xs text-[#68727b] line-clamp-1 max-w-xs">{s.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-[#68727b]">
                  {s.price ? `$${s.price}` : 'Varía'} &bull; {s.duration || 'Varía'}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${s.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {s.active ? 'Activo' : 'Oculto'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(s)} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition" title="Editar"><Edit2 size={18}/></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1" title="Eliminar"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {services?.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-[#68727b]">No hay servicios registrados.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Servicio' : 'Nuevo Servicio'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Nombre del tratamiento" name="name" defaultValue={editing?.name} required />
          <AdminTextarea label="Descripción" name="description" defaultValue={editing?.description} required />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Precio ($ USD)" name="price" type="number" step="0.01" defaultValue={editing?.price || ''} />
            <AdminInput label="Duración (ej. 60 min)" name="duration" defaultValue={editing?.duration || ''} />
          </div>
          <AdminInput label="URL de la imagen" name="imageUrl" defaultValue={editing?.imageUrl} required />
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <AdminInput label="Orden (menor aparece primero)" name="sortOrder" type="number" defaultValue={editing?.sortOrder || 0} required />
            </div>
            <div className="flex-1 pb-2">
              <AdminSwitch label="Visible al público" checked={activeToggle} onChange={setActiveToggle} />
            </div>
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-[#AF9275]/20">
            <AdminButton variant="outline" onClick={() => setModalOpen(false)}>Cancelar</AdminButton>
            <AdminButton variant="primary" type="submit" disabled={create.isPending || update.isPending}>Guardar Servicio</AdminButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}