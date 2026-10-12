import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { api } from "../lib/api";
import TopBar from "../components/TopBar";
import PresenceButton from "../components/PresenceButton";
import DogAvatar from "../components/DogAvatar";
import { dogDivIcon } from "../components/MapPin";
import { openOwnerChat, hapticNotification } from "../lib/telegram";
import EmptyState from "../components/EmptyState";
import { Link } from "react-router-dom";

const ROSTOV_CENTER: [number, number] = [47.2357, 39.7015];

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    const timeout = setTimeout(() => map.invalidateSize(), 150);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [map]);
  return null;
}

export default function MapScreen() {
  const queryClient = useQueryClient();
  const { data: profileData } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const hasProfile = Boolean(profileData?.dogProfile);

  const { data } = useQuery({
    queryKey: ["presence", "active"],
    queryFn: api.getActivePresence,
    refetchInterval: 20000,
    enabled: hasProfile,
  });
  const points = data?.points ?? [];
  const selfPoint = points.find((p) => p.isSelf);
  const [geoError, setGeoError] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: () =>
      new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("no_geolocation"));
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }).then(({ lat, lng }) => api.startPresence(lat, lng)),
    onSuccess: () => {
      setGeoError(null);
      hapticNotification("success");
      queryClient.invalidateQueries({ queryKey: ["presence", "active"] });
    },
    onError: () => setGeoError("Не получилось определить геопозицию. Разрешите доступ к ней в Telegram."),
  });

  const stopMutation = useMutation({
    mutationFn: api.stopPresence,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["presence", "active"] }),
  });

  const center = useMemo<[number, number]>(
    () => (selfPoint ? [selfPoint.lat, selfPoint.lng] : ROSTOV_CENTER),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (!hasProfile) {
    return (
      <EmptyState
        title="Сначала заполните анкету"
        subtitle="Нужен профиль питомца, чтобы выходить на карту прогулок"
        action={
          <Link to="/profile" className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white">
            Заполнить профиль
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Кто гуляет сейчас" subtitle={`${points.length} собак на прогулке в Ростове`} />

      {geoError && (
        <p className="mx-5 mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {geoError}
        </p>
      )}

      <div className="relative isolate flex-1 overflow-hidden rounded-t-3xl mx-3">
        <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
          <MapResizeFix />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p) => (
            <Marker key={p.sessionId} position={[p.lat, p.lng]} icon={dogDivIcon(p)}>
              <Popup minWidth={220} closeButton={false}>
                <Link to={`/dog/${p.dog.id}`} className="flex items-center gap-3 p-1">
                  <DogAvatar photoUrl={p.dog.photoUrl} size={48} />
                  <div className="flex-1">
                    <p className="font-semibold text-ink-800 dark:text-white">{p.dog.name}</p>
                    <p className="text-xs text-ink-400">{p.dog.breed}</p>
                  </div>
                </Link>
                {!p.isSelf && (
                  <button
                    onClick={() => openOwnerChat(p.dog.ownerUsername, p.dog.ownerTelegramId)}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-forest-700 py-2 text-sm font-semibold text-white"
                  >
                    <MessageCircle size={15} /> Написать хозяину
                  </button>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute inset-x-0 bottom-4 z-[1000] flex justify-center">
          <PresenceButton
            isWalking={Boolean(selfPoint)}
            expiresAt={selfPoint?.expiresAt}
            pending={startMutation.isPending || stopMutation.isPending}
            onStart={() => startMutation.mutate()}
            onStop={() => stopMutation.mutate()}
          />
        </div>
      </div>
    </div>
  );
}
