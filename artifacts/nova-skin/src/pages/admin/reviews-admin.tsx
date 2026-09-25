import { useEffect, useState } from "react";
import {
  getGetGoogleReviewSettingsQueryKey,
  getGetSiteQueryKey,
  getListGoogleBusinessLocationsQueryKey,
  getListTestimonialsQueryKey,
  useCreateTestimonial,
  useDeleteTestimonial,
  useDisconnectGoogleBusinessProfile,
  useGetGoogleReviewSettings,
  useListGoogleBusinessLocations,
  useListTestimonials,
  useStartGoogleBusinessProfileConnection,
  useSyncGoogleReviews,
  useUpdateGoogleReviewSettings,
  useUpdateTestimonial,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, ExternalLink, Plus, RefreshCw, Star, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminInput,
  AdminSwitch,
  AdminTextarea,
  Modal,
  PageHeader,
} from "../../components/admin/ui";
import { MediaUpload } from "../../components/admin/media-upload";

const LOCATION_INTERVALS = [15, 30, 60, 180, 720, 1440];

export function Testimonials() {
  const { data: items, isLoading } = useListTestimonials();
  const { data: googleSettings, isError: settingsError } = useGetGoogleReviewSettings();
  const locationsQuery = useListGoogleBusinessLocations({
    query: {
      queryKey: getListGoogleBusinessLocationsQueryKey(),
      enabled: Boolean(googleSettings?.businessProfileConnected),
    },
  });
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();
  const del = useDeleteTestimonial();
  const saveGoogleSettings = useUpdateGoogleReviewSettings();
  const connectGoogle = useStartGoogleBusinessProfileConnection();
  const disconnectGoogle = useDisconnectGoogleBusinessProfile();
  const sync = useSyncGoogleReviews();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedLocationKey, setSelectedLocationKey] = useState("");
  const [minRating, setMinRating] = useState(4);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [autoSyncEveryMinutes, setAutoSyncEveryMinutes] = useState(60);
  const [autoSyncThreshold, setAutoSyncThreshold] = useState(5);
  const [filterRating, setFilterRating] = useState("all");
  const [googleError, setGoogleError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [redirectCopied, setRedirectCopied] = useState(false);
  const oauthRedirectUri = `${window.location.origin}/api/admin/google-reviews/oauth/callback`;

  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("google");
    if (result === "connected") {
      setSyncMessage("Cuenta conectada. Selecciona la ficha y guarda la configuración antes de sincronizar.");
    } else if (result === "authorization-error") {
      setGoogleError("Google no completó la autorización. Revisa la configuración OAuth e inténtalo de nuevo.");
    }
    if (result) {
      url.searchParams.delete("google");
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, []);

  useEffect(() => {
    if (!googleSettings) return;
    setSelectedLocationKey(
      googleSettings.businessAccountName && googleSettings.businessLocationName
        ? `${googleSettings.businessAccountName}|${googleSettings.businessLocationName}`
        : "",
    );
    setMinRating(googleSettings.minRating);
    setAutoSyncEnabled(googleSettings.autoSyncEnabled);
    setAutoSyncEveryMinutes(googleSettings.autoSyncEveryMinutes);
    setAutoSyncThreshold(googleSettings.autoSyncThreshold);
  }, [googleSettings]);

  const invalidateReviews = () => {
    qc.invalidateQueries({ queryKey: getListTestimonialsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetSiteQueryKey() });
    qc.invalidateQueries({ queryKey: getGetGoogleReviewSettingsQueryKey() });
  };

  const errorMessage = (error: any, fallback: string) => {
    const message = String(error?.data?.error || error?.message || "");
    const normalized = message.toLowerCase();
    if (normalized.includes("oauth credentials") || normalized.includes("client credentials")) {
      return "Falta configurar la conexión OAuth de Google Business Profile en los secretos del proyecto.";
    }
    if (normalized.includes("authorization") || normalized.includes("reconnect")) {
      return "La autorización de Google venció o fue rechazada. Vuelve a conectar la cuenta.";
    }
    if (normalized.includes("select a business profile location")) {
      return "Conecta Google y selecciona una ficha verificada antes de sincronizar.";
    }
    return fallback;
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      name: String(form.get("name")),
      comment: String(form.get("comment")),
      rating: Number(form.get("rating")),
      photoUrl: form.get("photoUrl") ? String(form.get("photoUrl")) : null,
      active: editing?.source === "draft" ? false : active,
    };
    const options = {
      onSuccess: () => {
        invalidateReviews();
        setOpen(false);
      },
    };
    editing
      ? update.mutate({ id: editing.id, data }, options)
      : create.mutate({ data }, options);
  };

  const handleConnect = () => {
    setGoogleError("");
    connectGoogle.mutate(undefined, {
      onSuccess: (result) => window.location.assign(result.authorizationUrl),
      onError: (error) =>
        setGoogleError(errorMessage(error, "No se pudo iniciar la conexión con Google.")),
    });
  };

  const handleSaveSettings = () => {
    setGoogleError("");
    const selectedLocation = locationsQuery.data?.locations.find(
      (location) =>
        `${location.accountName}|${location.locationName}` === selectedLocationKey,
    );
    saveGoogleSettings.mutate(
      {
        data: {
          placeId: googleSettings?.placeId ?? null,
          placeName: googleSettings?.placeName ?? null,
          formattedAddress: googleSettings?.formattedAddress ?? null,
          googleMapsUrl: googleSettings?.googleMapsUrl ?? null,
          minRating,
          businessAccountName:
            selectedLocation?.accountName ?? googleSettings?.businessAccountName ?? null,
          businessLocationName:
            selectedLocation?.locationName ?? googleSettings?.businessLocationName ?? null,
          businessLocationTitle:
            selectedLocation?.title ?? googleSettings?.businessLocationTitle ?? null,
          autoSyncEnabled,
          autoSyncEveryMinutes,
          autoSyncThreshold,
        },
      },
      {
        onSuccess: () => {
          invalidateReviews();
          qc.invalidateQueries({ queryKey: getGetGoogleReviewSettingsQueryKey() });
          qc.invalidateQueries({ queryKey: getListGoogleBusinessLocationsQueryKey() });
          setSyncMessage("Configuración guardada.");
        },
        onError: (error) =>
          setGoogleError(errorMessage(error, "No se pudo guardar la configuración.")),
      },
    );
  };

  const handleSync = () => {
    setGoogleError("");
    setSyncMessage("");
    sync.mutate(undefined, {
      onSuccess: (result) => {
        invalidateReviews();
        setSyncMessage(
          result.skippedUntilThreshold
            ? `Google registra ${result.totalReviewCount} reseñas. La importación comenzará cuando supere ${autoSyncThreshold}.`
            : `Sincronización completada: ${result.syncedCount} reseñas revisadas de ${result.totalReviewCount}.`,
        );
      },
      onError: (error) =>
        setGoogleError(errorMessage(error, "No se pudieron sincronizar las reseñas.")),
    });
  };

  const handleDisconnect = () => {
    if (!confirm("¿Desconectar Google? Las reseñas importadas se ocultarán, pero no se eliminarán.")) return;
    disconnectGoogle.mutate(undefined, {
      onSuccess: () => {
        invalidateReviews();
        qc.invalidateQueries({ queryKey: getGetGoogleReviewSettingsQueryKey() });
        qc.invalidateQueries({ queryKey: getListGoogleBusinessLocationsQueryKey() });
      },
      onError: (error) =>
        setGoogleError(errorMessage(error, "No se pudo desconectar Google.")),
    });
  };

  const toggleVisibility = (item: any) => {
    if (item.source === "draft") return;
    update.mutate(
      {
        id: item.id,
        data: {
          name: item.name,
          comment: item.comment,
          rating: item.rating,
          photoUrl: item.photoUrl || null,
          active: !item.active,
        },
      },
      {
        onSuccess: invalidateReviews,
        onError: () => setGoogleError("No se pudo cambiar la visibilidad. Actualiza la página e inténtalo de nuevo."),
      },
    );
  };

  const visibleItems = [...(items || [])]
    .filter((item: any) => filterRating === "all" || item.rating >= Number(filterRating))
    .sort((left: any, right: any) => right.rating - left.rating);

  return (
    <>
      <PageHeader
        title="Reseñas"
        description="Gestiona reseñas verificadas de Google y testimonios autorizados."
        action={
          <AdminButton
            onClick={() => {
              setEditing(null);
              setPhotoUrl("");
              setActive(true);
              setOpen(true);
            }}
          >
            <Plus size={16} /> Nueva reseña manual
          </AdminButton>
        }
      />

      <section className="mb-8 rounded-xl border border-[#AF9275]/20 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5">
          <h2 className="font-serif text-2xl text-[#2F4055]">Google Business Profile</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#68727b]">
            Conecta la cuenta con acceso a la ficha verificada. La sincronización consulta todas
            las páginas de reseñas y puede ejecutarse automáticamente según esta configuración.
          </p>
        </div>

        {settingsError && (
          <p className="mb-4 rounded-md bg-[#A83525]/10 p-3 text-sm text-[#A83525]">
            No se pudo cargar la configuración de Google.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <AdminButton
            type="button"
            variant="outline"
            onClick={handleConnect}
            disabled={connectGoogle.isPending}
          >
            {connectGoogle.isPending ? "Conectando…" : googleSettings?.businessProfileConnected ? "Cambiar cuenta de Google" : "Conectar cuenta de Google"}
          </AdminButton>
          {googleSettings?.businessProfileConnected && (
            <>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Cuenta conectada
              </span>
              <AdminButton
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnectGoogle.isPending}
              >
                {disconnectGoogle.isPending ? "Desconectando…" : "Desconectar"}
              </AdminButton>
            </>
          )}
        </div>
        {!googleSettings?.businessProfileConnected && (
          <div className="mt-4 rounded-lg border border-[#AF9275]/25 bg-[#F2F2EF] p-4">
            <p className="text-sm font-semibold text-[#2F4055]">
              Antes de conectar
            </p>
            <p className="mt-1 text-sm leading-6 text-[#68727b]">
              En el proyecto de Google Cloud habilita las APIs de Business Profile y configura
              una pantalla OAuth con el permiso de administración del perfil. Registra esta URL
              como URI de redirección autorizada:
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 break-all rounded-md bg-white px-3 py-2 text-xs text-[#2F4055]">
                {oauthRedirectUri}
              </code>
              <AdminButton
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(oauthRedirectUri);
                    setRedirectCopied(true);
                    window.setTimeout(() => setRedirectCopied(false), 1800);
                  } catch {
                    setGoogleError("No se pudo copiar la URL. Selecciónala y cópiala manualmente.");
                  }
                }}
              >
                {redirectCopied ? "Copiada" : "Copiar URL"}
              </AdminButton>
            </div>
            <a
              href="https://developers.google.com/my-business/content/basic-setup"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8d6d2d] hover:underline"
            >
              Guía de configuración de Google <ExternalLink size={12} />
            </a>
          </div>
        )}

        {googleSettings?.businessProfileConnected && (
          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="google-business-location"
                className="text-xs font-semibold uppercase tracking-wider text-[#68727b]"
              >
                Ficha del negocio
              </label>
              <select
                id="google-business-location"
                value={selectedLocationKey}
                onChange={(event) => setSelectedLocationKey(event.target.value)}
                className="rounded-md border border-[#AF9275]/50 bg-white px-3 py-2 text-sm text-[#2F4055]"
              >
                <option value="">Selecciona una ficha verificada</option>
                {(locationsQuery.data?.locations || []).map((location) => (
                  <option
                    key={`${location.accountName}|${location.locationName}`}
                    value={`${location.accountName}|${location.locationName}`}
                  >
                    {location.title}{location.address ? ` — ${location.address}` : ""}
                  </option>
                ))}
              </select>
              {locationsQuery.isLoading && (
                <span className="text-xs text-[#68727b]">Cargando fichas…</span>
              )}
              {locationsQuery.isError && (
                <span className="text-xs text-[#A83525]">
                  Google no permitió consultar las fichas. Revisa los permisos de la cuenta y de la API.
                </span>
              )}
            </div>
            <a
              href="https://support.google.com/business/answer/7107242"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 pb-2 text-xs font-semibold text-[#8d6d2d] hover:underline"
            >
              Ayuda de Google <ExternalLink size={12} />
            </a>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminInput
            label="Publicar reseñas desde"
            type="number"
            min="1"
            max="5"
            value={minRating}
            onChange={(event: any) =>
              setMinRating(Math.min(5, Math.max(1, Number(event.target.value) || 1)))
            }
          />
          <AdminInput
            label="Importar al superar"
            type="number"
            min="0"
            value={autoSyncThreshold}
            onChange={(event: any) =>
              setAutoSyncThreshold(Math.max(0, Number(event.target.value) || 0))
            }
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="google-review-interval"
              className="text-xs font-semibold uppercase tracking-wider text-[#68727b]"
            >
              Revisar cada
            </label>
            <select
              id="google-review-interval"
              value={autoSyncEveryMinutes}
              onChange={(event) => setAutoSyncEveryMinutes(Number(event.target.value))}
              className="rounded-md border border-[#AF9275]/50 bg-white px-3 py-2 text-sm text-[#2F4055]"
            >
              {LOCATION_INTERVALS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes < 60 ? `${minutes} minutos` : `${minutes / 60} hora${minutes === 60 ? "" : "s"}`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <AdminSwitch
              label="Sincronización automática"
              checked={autoSyncEnabled}
              onChange={setAutoSyncEnabled}
            />
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#68727b]">
          Al superar el umbral, se importarán las reseñas disponibles en todas las páginas de la
          ficha. Las reseñas con calificación inferior al mínimo se guardan ocultas. Si cambias o
          desconectas la ficha, las reseñas importadas se ocultan sin borrarse. Las decisiones
          manuales de visibilidad se mantienen en sincronizaciones posteriores.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="gold"
            onClick={handleSaveSettings}
            disabled={saveGoogleSettings.isPending}
          >
            {saveGoogleSettings.isPending ? "Guardando…" : "Guardar configuración"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            onClick={handleSync}
            disabled={sync.isPending || !googleSettings?.businessProfileConnected}
          >
            <RefreshCw size={15} className={sync.isPending ? "animate-spin" : ""} />
            {sync.isPending ? "Sincronizando…" : "Sincronizar ahora"}
          </AdminButton>
        </div>
        {googleError && (
          <p className="mt-3 rounded-md bg-[#A83525]/10 p-3 text-sm text-[#A83525]">{googleError}</p>
        )}
        {syncMessage && (
          <p className="mt-3 rounded-md bg-[#e6e1d9] p-3 text-sm text-[#2F4055]">{syncMessage}</p>
        )}
        {googleSettings?.lastSyncError && (
          <p className="mt-3 rounded-md bg-[#A83525]/10 p-3 text-sm text-[#A83525]">
            Último error de sincronización: {googleSettings.lastSyncError}
          </p>
        )}
        {googleSettings?.lastSyncedAt && (
          <p className="mt-4 text-xs text-[#68727b]">
            Última revisión: {new Date(googleSettings.lastSyncedAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
            {" · "}{googleSettings.totalReviewCount} reseñas en Google
          </p>
        )}
      </section>

      <section className="rounded-xl border border-[#AF9275]/20 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#AF9275]/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-[#2F4055]">Todas las reseñas</h2>
            <p className="mt-1 text-sm text-[#68727b]">
              {items?.length || 0} registro{items?.length === 1 ? "" : "s"} · los borradores internos no se muestran al público
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="review-filter" className="text-xs font-semibold uppercase tracking-wider text-[#68727b]">
              Filtrar
            </label>
            <select
              id="review-filter"
              value={filterRating}
              onChange={(event) => setFilterRating(event.target.value)}
              className="rounded-md border border-[#AF9275]/50 bg-white px-3 py-2 text-sm text-[#2F4055]"
            >
              <option value="all">Todas</option>
              <option value="5">5 estrellas</option>
              <option value="4">4+ estrellas</option>
              <option value="3">3+ estrellas</option>
            </select>
          </div>
        </div>
        {isLoading ? (
          <p className="p-8 text-center text-sm text-[#68727b]">Cargando reseñas…</p>
        ) : visibleItems.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#68727b]">No hay registros para este filtro.</p>
        ) : (
          <div className="divide-y divide-[#AF9275]/20">
            {visibleItems.map((item: any) => {
              const isDraft = item.source === "draft";
              const isGoogle = item.source === "google";
              const currentLocationPrefix =
                googleSettings?.businessAccountName && googleSettings.businessLocationName
                  ? `${googleSettings.businessAccountName}/${googleSettings.businessLocationName}/reviews/`
                  : "";
              const canPublishGoogle =
                googleSettings?.businessProfileConnected &&
                Boolean(currentLocationPrefix) &&
                item.externalId?.startsWith(currentLocationPrefix);
              return (
                <article
                  key={item.id}
                  data-testid={`review-card-${item.id}`}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#2F4055]">{item.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isDraft ? "bg-amber-100 text-amber-900" : isGoogle ? "bg-[#e6e1d9] text-[#2F4055]" : "bg-[#BB9445]/15 text-[#8d6d2d]"}`}>
                        {isDraft ? "Ejemplo interno · no real" : isGoogle ? "Google" : "Manual"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isDraft ? "bg-amber-100 text-amber-900" : item.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                        {isDraft ? "No publicable" : item.active ? "Visible" : "Oculta"}
                      </span>
                      {isGoogle && item.visibilityOverride !== null && (
                        <span className="rounded-full bg-[#e6e1d9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2F4055]">
                          Visibilidad manual
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[#BB9445]" aria-label={`${item.rating} de 5 estrellas`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={star <= item.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-[#68727b]">
                      “{item.comment}”
                    </p>
                    {item.reviewDate && (
                      <time className="mt-2 block text-xs text-[#9a8c80]" dateTime={item.reviewDate}>
                        {new Date(item.reviewDate).toLocaleDateString("es-MX", { dateStyle: "medium" })}
                      </time>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 md:pt-1">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(item)}
                      disabled={update.isPending || isDraft || (isGoogle && !item.active && !canPublishGoogle)}
                      title={isGoogle && !canPublishGoogle ? "Conecta y selecciona la ficha correspondiente para publicar" : undefined}
                      className="rounded-md px-3 py-2 text-xs font-semibold text-[#2F4055] transition hover:bg-[#e6e1d9] disabled:opacity-50"
                    >
                      {isDraft ? "No publicable" : item.active ? "Ocultar" : "Publicar"}
                    </button>
                    {!isGoogle && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setPhotoUrl(item.photoUrl || "");
                            setActive(item.active);
                            setOpen(true);
                          }}
                          className="rounded-md p-2 text-[#BB9445] transition hover:bg-[#e6e1d9]"
                          aria-label={isDraft ? "Editar borrador" : "Editar reseña"}
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(isDraft ? "¿Eliminar este borrador?" : "¿Eliminar esta reseña?")) {
                              del.mutate({ id: item.id }, { onSuccess: invalidateReviews });
                            }
                          }}
                          className="rounded-md p-2 text-[#A83525] transition hover:bg-[#A83525]/10"
                          aria-label={isDraft ? "Eliminar borrador" : "Eliminar reseña"}
                        >
                          <Trash2 size={17} />
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? editing.source === "draft" ? "Editar borrador interno" : "Editar reseña manual" : "Nueva reseña manual"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {editing?.source === "draft" && (
            <p className="rounded-md bg-amber-100 p-3 text-sm leading-5 text-amber-950">
              Este texto es una plantilla ficticia. No se puede publicar como opinión; reemplázalo
              solo con una reseña auténtica y autorizada. Para publicarla, crea un nuevo registro
              manual con el texto real y elimina este borrador.
            </p>
          )}
          <AdminInput label="Nombre del cliente o título del borrador" name="name" defaultValue={editing?.name} required />
          <AdminTextarea label="Comentario" name="comment" defaultValue={editing?.comment} required />
          <AdminInput label="Calificación (1-5)" name="rating" type="number" min="1" max="5" defaultValue={editing?.rating || 5} required />
          <MediaUpload kind="image" value={photoUrl} onUploaded={setPhotoUrl} label="Cargar foto (opcional)" />
          <AdminInput label="URL de foto (opcional)" name="photoUrl" value={photoUrl} onChange={(event: any) => setPhotoUrl(event.target.value)} />
          {editing?.source !== "draft" && (
            <div className="pt-2">
              <AdminSwitch label="Visible al público" checked={active} onChange={setActive} />
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-[#AF9275]/20 pt-6">
            <AdminButton type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</AdminButton>
            <AdminButton type="submit" disabled={create.isPending || update.isPending}>Guardar</AdminButton>
          </div>
        </form>
      </Modal>
    </>
  );
}