import { useEffect, useState } from 'react';
import { 
  useListGalleryImages, useCreateGalleryImage, useUpdateGalleryImage, useDeleteGalleryImage, getListGalleryImagesQueryKey,
  useListVideos, useCreateVideo, useUpdateVideo, useDeleteVideo, getListVideosQueryKey,
  useListPromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, getListPromotionsQueryKey,
  useListSpecialists, useCreateSpecialist, useUpdateSpecialist, useDeleteSpecialist, getListSpecialistsQueryKey,
  useListTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, getListTestimonialsQueryKey,
  useGetGoogleReviewSettings, useUpdateGoogleReviewSettings, useLookupGoogleReviews, useSyncGoogleReviews,
  getGetGoogleReviewSettingsQueryKey, getGetSiteQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader, AdminButton, Modal, AdminInput, AdminTextarea, AdminSwitch } from '../../components/admin/ui';
import { MediaUpload } from '../../components/admin/media-upload';
import { Edit2, Trash2, Plus, Search, RefreshCw, MapPin, ExternalLink, Star } from 'lucide-react';
export { Testimonials } from './reviews-admin';

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
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { title: String(f.get('title')), description: String(f.get('description')), imageUrl: String(f.get('imageUrl')), sortOrder: Number(f.get('sortOrder')), active };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListGalleryImagesQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Galería" description="Imágenes de las instalaciones y ambiente." items={items} isLoading={isLoading} columns={['Imagen', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setImageUrl(""); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            <img src={item.imageUrl} className="h-14 w-20 object-cover rounded-lg border border-[#AF9275]/20 bg-[#F2F2EF]" />
            <div><p className="font-semibold text-[#2F4055]">{item.title}</p><p className="mt-0.5 text-xs text-[#68727b]">{item.description}</p></div>
          </td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activa' : 'Oculta'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setImageUrl(item.imageUrl); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar imagen?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListGalleryImagesQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Imagen' : 'Nueva Imagen'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Título" name="title" defaultValue={editing?.title} required />
          <AdminTextarea label="Descripción" name="description" defaultValue={editing?.description} required />
          <MediaUpload kind="image" value={imageUrl} onUploaded={setImageUrl} />
          <AdminInput label="URL de Imagen (opcional si cargas un archivo)" name="imageUrl" value={imageUrl} onChange={(e: any) => setImageUrl(e.target.value)} required />
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
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { title: String(f.get('title')), description: String(f.get('description')), videoUrl: String(f.get('videoUrl')), posterUrl: f.get('posterUrl') ? String(f.get('posterUrl')) : null, sortOrder: Number(f.get('sortOrder')), active };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListVideosQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Videos" description="Videos que muestran la experiencia en la clínica." items={items} isLoading={isLoading} columns={['Video', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setVideoUrl(""); setPosterUrl(""); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            {item.posterUrl ? <img src={item.posterUrl} className="h-14 w-24 object-cover rounded-lg border border-[#AF9275]/20 bg-[#F2F2EF]" /> : <div className="h-14 w-24 rounded-lg bg-[#2F4055] flex items-center justify-center text-[#BB9445] font-bold text-xs border border-[#AF9275]/20">VIDEO</div>}
            <div><p className="font-semibold text-[#2F4055]">{item.title}</p><p className="mt-0.5 text-xs text-[#68727b]">{item.description}</p></div>
          </td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activo' : 'Oculto'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setVideoUrl(item.videoUrl); setPosterUrl(item.posterUrl || ""); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar video?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListVideosQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Video' : 'Nuevo Video'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Título" name="title" defaultValue={editing?.title} required />
          <AdminTextarea label="Descripción" name="description" defaultValue={editing?.description} required />
          <MediaUpload kind="video" value={videoUrl} onUploaded={setVideoUrl} />
          <AdminInput label="URL del Video (MP4)" name="videoUrl" value={videoUrl} onChange={(e: any) => setVideoUrl(e.target.value)} required />
          <MediaUpload kind="image" value={posterUrl} onUploaded={setPosterUrl} label="Cargar poster (opcional)" />
          <AdminInput label="URL del Poster (Opcional)" name="posterUrl" value={posterUrl} onChange={(e: any) => setPosterUrl(e.target.value)} />
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
  const [imageUrl, setImageUrl] = useState("");

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
      <GenericList title="Promociones" description="Ofertas y campañas activas." items={items} isLoading={isLoading} columns={['Promoción', 'Fechas', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setImageUrl(""); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            <img src={item.imageUrl} className="h-12 w-12 object-cover rounded-lg border border-[#AF9275]/20 bg-[#F2F2EF]" />
            <div><p className="font-semibold text-[#2F4055]">{item.title}</p></div>
          </td>
          <td className="p-4 text-sm text-[#68727b]">{new Date(item.startDate).toLocaleDateString()} &mdash; {new Date(item.endDate).toLocaleDateString()}</td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activa' : 'Oculta'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setImageUrl(item.imageUrl); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar promoción?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListPromotionsQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Promoción' : 'Nueva Promoción'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Título de Campaña" name="title" defaultValue={editing?.title} required />
          <AdminTextarea label="Descripción" name="description" defaultValue={editing?.description} required />
          <MediaUpload kind="image" value={imageUrl} onUploaded={setImageUrl} />
          <AdminInput label="URL de Imagen" name="imageUrl" value={imageUrl} onChange={(e: any) => setImageUrl(e.target.value)} required />
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
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { name: String(f.get('name')), specialty: String(f.get('specialty')), bio: String(f.get('bio')), photoUrl: String(f.get('photoUrl')), instagram: f.get('instagram') ? String(f.get('instagram')) : null, active };
    const opt = { onSuccess: () => { qc.invalidateQueries({ queryKey: getListSpecialistsQueryKey() }); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  return (
    <>
      <GenericList title="Especialistas" description="Miembros del equipo Nova Skin." items={items} isLoading={isLoading} columns={['Especialista', 'Especialidad', 'Estado', 'Acciones']} onNew={() => { setEditing(null); setPhotoUrl(""); setActive(true); setOpen(true); }} renderRow={(item: any) => (
        <tr key={item.id} className="hover:bg-[#F2F2EF]/50 transition-colors">
          <td className="p-4 flex gap-4 items-center">
            <img src={item.photoUrl} className="h-12 w-12 object-cover rounded-full border border-[#BB9445]/30 bg-[#F2F2EF]" />
            <div><p className="font-semibold text-[#2F4055]">{item.name}</p></div>
          </td>
          <td className="p-4 text-xs font-bold text-[#68727b] uppercase tracking-[.15em]">{item.specialty}</td>
          <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.active ? 'Activo' : 'Oculto'}</span></td>
          <td className="p-4 text-right">
            <button onClick={() => { setEditing(item); setPhotoUrl(item.photoUrl); setActive(item.active); setOpen(true); }} className="p-2 text-[#BB9445] hover:bg-[#e6e1d9] rounded-md transition"><Edit2 size={18}/></button>
            <button onClick={() => { if(confirm('¿Eliminar especialista?')) del.mutate({ id: item.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListSpecialistsQueryKey() }) }); }} className="p-2 text-[#A83525] hover:bg-[#A83525]/10 rounded-md transition ml-1"><Trash2 size={18}/></button>
          </td>
        </tr>
      )} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar Especialista' : 'Nuevo Especialista'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Nombre y Apellido" name="name" defaultValue={editing?.name} required />
          <AdminInput label="Especialidad" name="specialty" defaultValue={editing?.specialty} required />
          <AdminTextarea label="Biografía" name="bio" defaultValue={editing?.bio} required />
          <MediaUpload kind="image" value={photoUrl} onUploaded={setPhotoUrl} label="Cargar foto desde tu dispositivo" />
          <AdminInput label="URL de Foto" name="photoUrl" value={photoUrl} onChange={(e: any) => setPhotoUrl(e.target.value)} required />
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

export function LegacyTestimonials() {
  const { data: items, isLoading } = useListTestimonials();
  const { data: googleSettings, isError: settingsError } = useGetGoogleReviewSettings();
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();
  const del = useDeleteTestimonial();
  const saveGoogleSettings = useUpdateGoogleReviewSettings();
  const lookup = useLookupGoogleReviews();
  const sync = useSyncGoogleReviews();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("Av. Juárez 4955, Plaza Laguna Oriente, Local 43");
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [minRating, setMinRating] = useState(4);
  const [filterRating, setFilterRating] = useState("all");
  const [googleError, setGoogleError] = useState("");

  useEffect(() => {
    if (!googleSettings) return;
    setSelectedPlace(googleSettings.placeId ? {
      placeId: googleSettings.placeId,
      placeName: googleSettings.placeName,
      formattedAddress: googleSettings.formattedAddress,
      googleMapsUrl: googleSettings.googleMapsUrl,
    } : null);
    setMinRating(googleSettings.minRating);
  }, [googleSettings]);

  const invalidateReviews = () => {
    qc.invalidateQueries({ queryKey: getListTestimonialsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetSiteQueryKey() });
    qc.invalidateQueries({ queryKey: getGetGoogleReviewSettingsQueryKey() });
  };
  const errorMessage = (error: any, fallback: string) => {
    const message = String(error?.data?.error || error?.message || "");
    const normalized = message.toLowerCase();
    if (normalized.includes("api key")) {
      return "La integración de Google Maps no está configurada (falta GOOGLE_MAPS_API_KEY). Las reseñas manuales siguen disponibles.";
    }
    if (normalized.includes("no matching google place")) {
      return "No encontramos ese negocio en Google. Revisa el nombre o la dirección e inténtalo de nuevo.";
    }
    if (normalized.includes("google places lookup")) {
      return "Google no pudo completar la búsqueda del negocio. Revisa la configuración e inténtalo de nuevo.";
    }
    if (normalized.includes("google places sync")) {
      return "Google no pudo sincronizar las reseñas. Inténtalo de nuevo más tarde.";
    }
    if (normalized.includes("must be configured")) {
      return "Selecciona y guarda un negocio de Google antes de sincronizar las reseñas.";
    }
    return fallback;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { name: String(f.get('name')), comment: String(f.get('comment')), rating: Number(f.get('rating')), photoUrl: f.get('photoUrl') ? String(f.get('photoUrl')) : null, active };
    const opt = { onSuccess: () => { invalidateReviews(); setOpen(false); } };
    editing ? update.mutate({ id: editing.id, data: d }, opt) : create.mutate({ data: d }, opt);
  };

  const handleLookup = () => {
    setGoogleError("");
    if (!searchQuery.trim()) {
      setGoogleError("Escribe una dirección o nombre de negocio para buscar.");
      return;
    }
    lookup.mutate({ data: { query: searchQuery.trim() } }, {
      onSuccess: (place) => setSelectedPlace(place),
      onError: (error) => setGoogleError(errorMessage(error, "No se encontró el negocio. Revisa la búsqueda e inténtalo de nuevo.")),
    });
  };

  const handleSaveSettings = () => {
    setGoogleError("");
    saveGoogleSettings.mutate({
      data: {
        placeId: selectedPlace?.placeId || null,
        placeName: selectedPlace?.placeName || null,
        formattedAddress: selectedPlace?.formattedAddress || null,
        googleMapsUrl: selectedPlace?.googleMapsUrl || null,
        minRating,
      },
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetGoogleReviewSettingsQueryKey() });
        invalidateReviews();
      },
      onError: (error) => setGoogleError(errorMessage(error, "No pudimos guardar la configuración de Google.")),
    });
  };

  const handleSync = () => {
    setGoogleError("");
    sync.mutate(undefined, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetGoogleReviewSettingsQueryKey() });
        invalidateReviews();
      },
      onError: (error) => setGoogleError(errorMessage(error, "No pudimos sincronizar las reseñas de Google.")),
    });
  };

  const toggleVisibility = (item: any) => {
    update.mutate({
      id: item.id,
      data: {
        name: item.name,
        comment: item.comment,
        rating: item.rating,
        photoUrl: item.photoUrl || null,
        active: !item.active,
      },
    }, { onSuccess: invalidateReviews });
  };

  const visibleItems = [...(items || [])]
    .filter((item: any) => filterRating === "all" || item.rating >= Number(filterRating))
    .sort((a: any, b: any) => b.rating - a.rating);

  return (
    <>
      <PageHeader title="Reseñas" description="Gestiona las reseñas de Google y los testimonios de tus clientes." action={<AdminButton onClick={() => { setEditing(null); setPhotoUrl(""); setActive(true); setOpen(true); }}><Plus size={16}/> Nueva reseña manual</AdminButton>} />
      <section className="mb-8 rounded-xl border border-[#AF9275]/20 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5">
          <h2 className="font-serif text-2xl text-[#2F4055]">Configuración de Google</h2>
          <p className="mt-1 text-sm text-[#68727b]">Busca tu negocio para importar y mantener actualizadas tus reseñas.</p>
        </div>
        {settingsError && <p className="mb-4 rounded-md bg-[#A83525]/10 p-3 text-sm text-[#A83525]">No pudimos cargar la configuración de Google. Puedes seguir gestionando reseñas manuales.</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <AdminInput label="Buscar negocio o dirección" data-testid="input-google-review-search" value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} className="flex-1" />
          <AdminButton type="button" data-testid="button-search-google-business" variant="outline" className="mt-auto min-h-10" onClick={handleLookup} disabled={lookup.isPending}><Search size={16}/>{lookup.isPending ? "Buscando…" : "Buscar negocio"}</AdminButton>
        </div>
        {lookup.isError && <p className="mt-3 text-sm text-[#A83525]">{googleError}</p>}
        {selectedPlace && <div className="mt-5 rounded-lg border border-[#BB9445]/30 bg-[#F2F2EF] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-[#BB9445]" size={19}/><div><p className="font-semibold text-[#2F4055]">{selectedPlace.placeName}</p><p className="mt-1 text-sm text-[#68727b]">{selectedPlace.formattedAddress}</p>{selectedPlace.googleMapsUrl && <a href={selectedPlace.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#BB9445] hover:underline">Ver en Google Maps <ExternalLink size={12}/></a>}</div></div>
            <span className="rounded-full bg-[#BB9445]/15 px-2.5 py-1 text-xs font-semibold text-[#8d6d2d]">Negocio seleccionado</span>
          </div>
        </div>}
        <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-end">
          <AdminInput label="Publicar desde" data-testid="input-google-min-rating" type="number" min="1" max="5" value={minRating} onChange={(e: any) => setMinRating(Math.min(5, Math.max(1, Number(e.target.value) || 1)))} />
          <div className="flex flex-wrap gap-2">
            <AdminButton type="button" data-testid="button-save-google-settings" variant="gold" onClick={handleSaveSettings} disabled={saveGoogleSettings.isPending}>{saveGoogleSettings.isPending ? "Guardando…" : "Guardar configuración"}</AdminButton>
            <AdminButton type="button" data-testid="button-sync-google-reviews" variant="outline" onClick={handleSync} disabled={sync.isPending || !googleSettings?.placeId && !selectedPlace?.placeId}><RefreshCw size={15} className={sync.isPending ? "animate-spin" : ""}/>{sync.isPending ? "Sincronizando…" : "Sincronizar reseñas"}</AdminButton>
          </div>
        </div>
        {googleError && !lookup.isError && <p className="mt-3 rounded-md bg-[#A83525]/10 p-3 text-sm text-[#A83525]">{googleError}</p>}
        {googleSettings?.lastSyncedAt && <p className="mt-4 text-xs text-[#68727b]">Última sincronización: {new Date(googleSettings.lastSyncedAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</p>}
      </section>

      <section className="rounded-xl border border-[#AF9275]/20 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#AF9275]/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-serif text-2xl text-[#2F4055]">Todas las reseñas</h2><p className="mt-1 text-sm text-[#68727b]">{items?.length || 0} reseña{items?.length === 1 ? "" : "s"} en total</p></div>
          <div className="flex items-center gap-2"><label htmlFor="review-filter" className="text-xs font-semibold uppercase tracking-wider text-[#68727b]">Filtrar</label><select id="review-filter" data-testid="select-review-filter" value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="rounded-md border border-[#AF9275]/50 bg-white px-3 py-2 text-sm text-[#2F4055]"><option value="all">Todas</option><option value="5">5 estrellas</option><option value="4">4+ estrellas</option><option value="3">3+ estrellas</option></select></div>
        </div>
        {isLoading ? <p className="p-8 text-center text-sm text-[#68727b]">Cargando reseñas…</p> : visibleItems.length === 0 ? <p className="p-8 text-center text-sm text-[#68727b]">No hay reseñas para este filtro.</p> : <div className="divide-y divide-[#AF9275]/20">{visibleItems.map((item: any) => <article key={item.id} data-testid={`review-card-${item.id}`} className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#2F4055]">{item.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${item.source === "google" ? "bg-[#e6e1d9] text-[#2F4055]" : "bg-[#BB9445]/15 text-[#8d6d2d]"}`}>{item.source === "google" ? "Google" : "Manual"}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${item.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{item.active ? "Visible" : "Oculta"}</span></div>
            <div className="mt-2 flex items-center gap-1 text-[#BB9445]" aria-label={`${item.rating} de 5 estrellas`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill={star <= item.rating ? "currentColor" : "none"} />)}</div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#68727b]">“{item.comment}”</p>
            {item.reviewDate && <time className="mt-2 block text-xs text-[#9a8c80]" dateTime={item.reviewDate}>{new Date(item.reviewDate).toLocaleDateString("es-MX", { dateStyle: "medium" })}</time>}
          </div>
          <div className="flex shrink-0 items-center gap-1 md:pt-1">
            <button type="button" data-testid={`button-toggle-review-${item.id}`} onClick={() => toggleVisibility(item)} disabled={update.isPending} className="rounded-md px-3 py-2 text-xs font-semibold text-[#2F4055] transition hover:bg-[#e6e1d9]">{item.active ? "Ocultar" : "Publicar"}</button>
            {item.source !== "google" && <><button type="button" data-testid={`button-edit-review-${item.id}`} onClick={() => { setEditing(item); setPhotoUrl(item.photoUrl || ""); setActive(item.active); setOpen(true); }} className="rounded-md p-2 text-[#BB9445] transition hover:bg-[#e6e1d9]" aria-label="Editar reseña"><Edit2 size={17}/></button><button type="button" data-testid={`button-delete-review-${item.id}`} onClick={() => { if (confirm("¿Eliminar reseña manual?")) del.mutate({ id: item.id }, { onSuccess: invalidateReviews }); }} className="rounded-md p-2 text-[#A83525] transition hover:bg-[#A83525]/10" aria-label="Eliminar reseña"><Trash2 size={17}/></button></>}
          </div>
        </article>)}</div>}
      </section>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Editar reseña manual' : 'Nueva reseña manual'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminInput label="Nombre del Cliente" name="name" defaultValue={editing?.name} required />
          <AdminTextarea label="Comentario" name="comment" defaultValue={editing?.comment} required />
          <AdminInput label="Calificación de estrellas (1-5)" name="rating" type="number" min="1" max="5" defaultValue={editing?.rating || 5} required />
          <MediaUpload kind="image" value={photoUrl} onUploaded={setPhotoUrl} label="Cargar foto (opcional)" />
          <AdminInput label="URL de Foto (Opcional)" name="photoUrl" value={photoUrl} onChange={(e: any) => setPhotoUrl(e.target.value)} />
          <div className="pt-2">
            <AdminSwitch label="Visible al público" checked={active} onChange={setActive} />
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-[#AF9275]/20"><AdminButton variant="outline" onClick={() => setOpen(false)}>Cancelar</AdminButton><AdminButton type="submit" disabled={create.isPending || update.isPending}>Guardar</AdminButton></div>
        </form>
      </Modal>
    </>
  );
}