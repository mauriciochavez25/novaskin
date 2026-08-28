import { useState } from 'react';
import { 
  useListGalleryImages, useCreateGalleryImage, useUpdateGalleryImage, useDeleteGalleryImage, getListGalleryImagesQueryKey,
  useListVideos, useCreateVideo, useUpdateVideo, useDeleteVideo, getListVideosQueryKey,
  useListPromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, getListPromotionsQueryKey,
  useListSpecialists, useCreateSpecialist, useUpdateSpecialist, useDeleteSpecialist, getListSpecialistsQueryKey,
  useListTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, getListTestimonialsQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader, AdminButton, Modal, AdminInput, AdminTextarea, AdminSwitch } from '../../components/admin/ui';
import { Edit2, Trash2, Plus } from 'lucide-react';

function GenericList({ title, description, items, isLoading, columns, renderRow, onNew }: any) {
  if (isLoading) return <p className="text-[#68727b] font-medium">Cargando {title.toLowerCase()}...</p>;
  return (
    <div>
      <PageHeader title={title} description={description} action={<AdminButton onClick={onNew}><Plus size={16}/> Nuevo</AdminButton>} />
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-[#AF9275]/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#e6e1d9] text-xs uppercase tracking-wider text-[#2F4055]">
            <tr>{columns.map((c: string, i: number) => <th key={i} className={`p-4 ${i === columns.length - 1 ? 'text-right' : ''}`}>{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#AF9275]/20">
            {items?.map(renderRow)}
            {(!items || items.length === 0) && <tr><td colSpan={columns.length} className="p-10 text-center text-[#68727b]">No hay registros.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Gallery() {
  const { data: items, isLoading } = useListGalleryImages();
  const create = useCreateGalleryImage();
  const update = useUpdateGalleryImage();
  const del = useDeleteGalleryImage();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { title: String(f.get('title')), description: String(f.get('description')), imageUrl: String(f.get('imageUrl')), sortOrder: Number(f.get('sortOrder')), active };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListGalleryImagesQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Galería" description="Imágenes de las instalaciones y ambiente." items={items} isLoading={isLoading} columns={['Imagen', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            <img src={item.imageUrl} className="h-14 w-20 object-cover rounded-lg border border-[#AF9275]/20 bg-[#F2F2EF]" />
            <div><p className="font-semibold text-[#2F4055]">{item.title}</p><p className="mt-0.5 text-xs text-[#68727b]">{item.description}</p></div>
          </td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activa' : 'Oculta'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar imagen?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListGalleryImagesQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Imagen' : 'Nueva Imagen'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Título" name="title" defaultValue={editing?.title} required />
          <AdminTextarea label="Descripción" name="description" defaultValue={editing?.description} required />
          <AdminInput label="URL de Imagen" name="imageUrl" defaultValue={editing?.imageUrl} required />
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <AdminInput label="Orden" name="sortOrder" type="number" defaultValue={editing?.sortOrder || 0} required />
            </div>
            <div className="flex-1 pb-2">
              <AdminSwitch label="Visible" checked={active} onChange={setActive} />
            </div>
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-[#AF9275]/20"><AdminButton variant="outline" onClick={() => setOpen(false)}>Cancelar</AdminButton><AdminButton type="submit" disabled={create.isPending || update.isPending}>Guardar</AdminButton></div>
        </form>
      </Modal>
    </>
  );
}

export function Videos() {
  const { data: items, isLoading } = useListVideos();
  const create = useCreateVideo();
  const update = useUpdateVideo();
  const del = useDeleteVideo();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { title: String(f.get('title')), description: String(f.get('description')), videoUrl: String(f.get('videoUrl')), posterUrl: f.get('posterUrl') ? String(f.get('posterUrl')) : null, sortOrder: Number(f.get('sortOrder')), active };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListVideosQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Videos" description="Videos que muestran la experiencia en la clínica." items={items} isLoading={isLoading} columns={['Video', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            {item.posterUrl ? <img src={item.posterUrl} className="h-14 w-24 object-cover rounded-lg border border-[#AF9275]/20 bg-[#F2F2EF]" /> : <div className="h-14 w-24 rounded-lg bg-[#2F4055] flex items-center justify-center text-[#BB9445] font-bold text-xs border border-[#AF9275]/20">VIDEO</div>}
            <div><p className="font-semibold text-[#2F4055]">{item.title}</p><p className="mt-0.5 text-xs text-[#68727b]">{item.description}</p></div>
          </td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activo' : 'Oculto'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar video?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListVideosQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Video' : 'Nuevo Video'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Título" name="title" defaultValue={editing?.title} required />
          <AdminTextarea label="Descripción" name="description" defaultValue={editing?.description} required />
          <AdminInput label="URL del Video (MP4)" name="videoUrl" defaultValue={editing?.videoUrl} required />
          <AdminInput label="URL del Poster (Opcional)" name="posterUrl" defaultValue={editing?.posterUrl} />
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <AdminInput label="Orden" name="sortOrder" type="number" defaultValue={editing?.sortOrder || 0} required />
            </div>
            <div className="flex-1 pb-2">
              <AdminSwitch label="Visible" checked={active} onChange={setActive} />
            </div>
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-[#AF9275]/20"><AdminButton variant="outline" onClick={() => setOpen(false)}>Cancelar</AdminButton><AdminButton type="submit" disabled={create.isPending || update.isPending}>Guardar</AdminButton></div>
        </form>
      </Modal>
    </>
  );
}

export function Promotions() {
  const { data: items, isLoading } = useListPromotions();
  const create = useCreatePromotion();
  const update = useUpdatePromotion();
  const del = useDeletePromotion();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { 
      title: String(f.get('title')), 
      description: String(f.get('description')), 
      imageUrl: String(f.get('imageUrl')), 
      startDate: new Date(String(f.get('startDate'))).toISOString(), 
      endDate: new Date(String(f.get('endDate'))).toISOString(), 
      active 
    };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPromotionsQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Promociones" description="Ofertas y campañas activas." items={items} isLoading={isLoading} columns={['Promoción', 'Fechas', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            <img src={item.imageUrl} className="h-12 w-12 object-cover rounded-lg border border-[#AF9275]/20 bg-[#F2F2EF]" />
            <div><p className="font-semibold text-[#2F4055]">{item.title}</p></div>
          </td>
          <td className="p-4 text-sm text-[#68727b]">{new Date(item.startDate).toLocaleDateString()} &mdash; {new Date(item.endDate).toLocaleDateString()}</td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activa' : 'Oculta'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar promoción?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListPromotionsQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Promoción' : 'Nueva Promoción'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Título de Campaña" name="title" defaultValue={editing?.title} required />
          <AdminTextarea label="Descripción" name="description" defaultValue={editing?.description} required />
          <AdminInput label="URL de Imagen" name="imageUrl" defaultValue={editing?.imageUrl} required />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="Fecha Inicio" name="startDate" type="datetime-local" defaultValue={editing ? editing.startDate.slice(0, 16) : ''} required />
            <AdminInput label="Fecha Fin" name="endDate" type="datetime-local" defaultValue={editing ? editing.endDate.slice(0, 16) : ''} required />
          </div>
          <div className="pt-2">
            <AdminSwitch label="Visible al público" checked={active} onChange={setActive} />
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-[#AF9275]/20"><AdminButton variant="outline" onClick={() => setOpen(false)}>Cancelar</AdminButton><AdminButton type="submit" disabled={create.isPending || update.isPending}>Guardar</AdminButton></div>
        </form>
      </Modal>
    </>
  );
}

export function Specialists() {
  const { data: items, isLoading } = useListSpecialists();
  const create = useCreateSpecialist();
  const update = useUpdateSpecialist();
  const del = useDeleteSpecialist();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { name: String(f.get('name')), specialty: String(f.get('specialty')), bio: String(f.get('bio')), photoUrl: String(f.get('photoUrl')), instagram: f.get('instagram') ? String(f.get('instagram')) : null, active };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListSpecialistsQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Especialistas" description="Miembros del equipo NOVA." items={items} isLoading={isLoading} columns={['Especialista', 'Especialidad', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            <img src={item.photoUrl} className="h-12 w-12 object-cover rounded-full border border-[#BB9445]/30 bg-[#F2F2EF]" />
            <div><p className="font-semibold text-[#2F4055]">{item.name}</p></div>
          </td>
          <td className="p-4 text-xs font-bold text-[#68727b] uppercase tracking-[.15em]">{item.specialty}</td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activo' : 'Oculto'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar especialista?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListSpecialistsQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Especialista' : 'Nuevo Especialista'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Nombre y Apellido" name="name" defaultValue={editing?.name} required />
          <AdminInput label="Especialidad" name="specialty" defaultValue={editing?.specialty} required />
          <AdminTextarea label="Biografía" name="bio" defaultValue={editing?.bio} required />
          <AdminInput label="URL de Foto" name="photoUrl" defaultValue={editing?.photoUrl} required />
          <AdminInput label="Usuario de Instagram (Opcional)" name="instagram" defaultValue={editing?.instagram} />
          <div className="pt-2">
            <AdminSwitch label="Visible al público" checked={active} onChange={setActive} />
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-[#AF9275]/20"><AdminButton variant="outline" onClick={() => setOpen(false)}>Cancelar</AdminButton><AdminButton type="submit" disabled={create.isPending || update.isPending}>Guardar</AdminButton></div>
        </form>
      </Modal>
    </>
  );
}

export function Testimonials() {
  const { data: items, isLoading } = useListTestimonials();
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();
  const del = useDeleteTestimonial();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { name: String(f.get('name')), comment: String(f.get('comment')), rating: Number(f.get('rating')), photoUrl: f.get('photoUrl') ? String(f.get('photoUrl')) : null, active };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTestimonialsQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Testimonios" description="Lo que dicen nuestros clientes." items={items} isLoading={isLoading} columns={['Cliente', 'Valoración', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4">
            <p className="font-semibold text-[#2F4055]">{item.name}</p>
            <p className="mt-1 text-sm text-[#68727b] line-clamp-1 max-w-sm italic">"{item.comment}"</p>
          </td>
          <td className="p-4 text-[#BB9445] text-sm tracking-widest">{"★".repeat(item.rating)}{"☆".repeat(5-item.rating)}</td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activo' : 'Oculto'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar testimonio?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListTestimonialsQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Testimonio' : 'Nuevo Testimonio'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Nombre del Cliente" name="name" defaultValue={editing?.name} required />
          <AdminTextarea label="Comentario" name="comment" defaultValue={editing?.comment} required />
          <AdminInput label="Calificación de estrellas (1-5)" name="rating" type="number" min="1" max="5" defaultValue={editing?.rating || 5} required />
          <AdminInput label="URL de Foto (Opcional)" name="photoUrl" defaultValue={editing?.photoUrl} />
          <div className="pt-2">
            <AdminSwitch label="Visible al público" checked={active} onChange={setActive} />
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-[#AF9275]/20"><AdminButton variant="outline" onClick={() => setOpen(false)}>Cancelar</AdminButton><AdminButton type="submit" disabled={create.isPending || update.isPending}>Guardar</AdminButton></div>
        </form>
      </Modal>
    </>
  );
}