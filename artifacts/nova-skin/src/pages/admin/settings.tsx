import { useState } from 'react';
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader, AdminButton, AdminInput, AdminTextarea } from '../../components/admin/ui';
import { MediaUpload } from '../../components/admin/media-upload';
import { Check } from 'lucide-react';

export function Settings() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const update = useUpdateSiteSettings();
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [heroImage, setHeroImage] = useState('');

  if (isLoading) return <p className="text-[#68727b] font-medium">Cargando ajustes...</p>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      clinicName: String(f.get('clinicName')),
      tagline: String(f.get('tagline')),
      phone: String(f.get('phone')),
      whatsapp: String(f.get('whatsapp')),
      email: String(f.get('email')),
      address: String(f.get('address')),
      hours: String(f.get('hours')),
      instagram: String(f.get('instagram')),
      facebook: String(f.get('facebook')),
      tiktok: String(f.get('tiktok')),
      heroImage: heroImage || String(f.get('heroImage')),
      heroEyebrow: String(f.get('heroEyebrow')),
      heroTitle: String(f.get('heroTitle')),
      heroDescription: String(f.get('heroDescription')),
      aboutText: String(f.get('aboutText')),
    };
    update.mutate({ data: payload }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      <PageHeader title="Ajustes Generales" description="Información global de la clínica y la página principal." action={<AdminButton type="submit" variant="gold" disabled={update.isPending}>{update.isPending ? 'Guardando...' : saved ? <><Check size={16}/> Cambios Guardados</> : 'Guardar Cambios'}</AdminButton>} />
      
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-5 rounded-xl border border-[#AF9275]/20 bg-white p-7 shadow-sm">
          <h2 className="font-serif text-2xl text-[#2F4055] border-b border-[#AF9275]/20 pb-3">La Clínica</h2>
          <AdminInput label="Nombre Comercial" name="clinicName" defaultValue={settings?.clinicName} required />
          <AdminInput label="Lema (Tagline)" name="tagline" defaultValue={settings?.tagline} />
          <AdminInput label="Teléfono (Llamadas)" name="phone" defaultValue={settings?.phone} />
          <AdminInput label="WhatsApp (Para el botón)" name="whatsapp" defaultValue={settings?.whatsapp} />
            <AdminInput label="Email de Contacto" name="email" type="text" defaultValue={settings?.email} />
          <AdminInput label="Dirección Física" name="address" defaultValue={settings?.address} />
          <AdminInput label="Horarios de Atención" name="hours" defaultValue={settings?.hours} />
        </section>
        
        <div className="space-y-8">
          <section className="space-y-5 rounded-xl border border-[#AF9275]/20 bg-white p-7 shadow-sm">
            <h2 className="font-serif text-2xl text-[#2F4055] border-b border-[#AF9275]/20 pb-3">Redes Sociales</h2>
            <AdminInput label="Usuario o URL de Instagram" name="instagram" defaultValue={settings?.instagram} />
            <AdminInput label="Usuario o URL de Facebook" name="facebook" defaultValue={settings?.facebook} />
            <AdminInput label="Usuario o URL de TikTok" name="tiktok" defaultValue={settings?.tiktok} />
          </section>
          
          <section className="space-y-5 rounded-xl border border-[#AF9275]/20 bg-white p-7 shadow-sm">
            <h2 className="font-serif text-2xl text-[#2F4055] border-b border-[#AF9275]/20 pb-3">Sobre Nosotros</h2>
            <AdminTextarea label="Filosofía (Sección 01)" name="aboutText" defaultValue={settings?.aboutText} />
          </section>
        </div>

        <section className="space-y-5 rounded-xl border border-[#AF9275]/20 bg-white p-7 shadow-sm lg:col-span-2">
          <h2 className="font-serif text-2xl text-[#2F4055] border-b border-[#AF9275]/20 pb-3">Portada Principal (Hero)</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <MediaUpload kind="image" value={heroImage || settings?.heroImage} onUploaded={setHeroImage} label="Cargar imagen de portada desde tu dispositivo" />
            <AdminInput label="URL de Imagen de Fondo (o carga un archivo)" name="heroImage" value={heroImage || settings?.heroImage || ''} onChange={(e: any) => setHeroImage(e.target.value)} />
            <AdminInput label="Texto Superior Pequeño" name="heroEyebrow" defaultValue={settings?.heroEyebrow} />
            <div className="md:col-span-2">
              <AdminInput label="Título Principal" name="heroTitle" defaultValue={settings?.heroTitle} />
            </div>
            <div className="md:col-span-2">
              <AdminTextarea label="Descripción Principal" name="heroDescription" defaultValue={settings?.heroDescription} />
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}