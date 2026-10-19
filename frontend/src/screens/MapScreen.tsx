import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LocateFixed, MessageCircle } from "lucide-react";
import { api } from "../lib/api";
import TopBar from "../components/TopBar";
import PresenceButton from "../components/PresenceButton";
import DogAvatar from "../components/DogAvatar";
import SegmentedToggle from "../components/SegmentedToggle";
import { dogDivIcon } from "../components/MapPin";
import { openOwnerChat, hapticNotification } from "../lib/telegram";
import EmptyState from "../components/EmptyState";
import { Link } from "react-router-dom";
import type { PresenceScope } from "../lib/types";

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

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(false);

  function handleClick() {
    if (!navigator.geolocation) {
      setError(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 0.8 });
        setLocating(false);
        setError(false);
      },
      () => {
        setLocating(false);
        setError(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Показать моё местоположение"
      className="absolute right-3 top-3 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest-700 shadow-soft active:scale-90 transition-transform dark:bg-ink-800 dark:text-forest-300"
    >
      {locating ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <LocateFixed size={18} className={error ? "text-red-500" : undefined} />
      )}
    </button>
  );
}

export default function MapScreen() {
  const queryClient = useQueryClient();
  const { data: profileData } = useQuery({ queryKey: ["profile", "me"], queryFn: api.getMyProfile });
  const hasProfile = Boolean(profileData?.dogProfile);
  const [presenceScope, setPresenceScope] = useState<PresenceScope>("all");

  const { data } = useQuery({
    queryKey: ["presence", "active", presenceScope],
    queryFn: () => api.getActivePresence(presenceScope),
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

      <div className="px-5 pb-3">
        <SegmentedToggle
          value={presenceScope}
          onChange={setPresenceScope}
          options={[
            { value: "friends", label: "Друзья" },
            { value: "all", label: "Все" },
          ]}
        />
      </div>

      {geoError && (
        <p className="mx-5 mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {geoError}
        </p>
      )}

      <div className="relative isolate flex-1 overflow-hidden rounded-t-3xl mx-3">
        <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
          <MapResizeFix />
          <LocateButton />
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
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

        {points.length === 0 && (
          <div className="pointer-events-none absolute left-4 right-16 top-4 z-[999] rounded-2xl bg-white/95 px-4 py-3 text-center shadow-soft backdrop-blur-sm dark:bg-ink-800/95">
            <p className="text-sm font-semibold text-ink-800 dark:text-white">
              {presenceScope === "friends" ? "Друзья пока не гуляют" : "Сейчас никто не гуляет"}
            </p>
            <p className="mt-0.5 text-xs text-ink-400">
              {presenceScope === "friends"
                ? "Загляните на вкладку «Все» или подпишитесь на новых друзей"
                : "Станьте первым — нажмите «Начать прогулку»"}
            </p>
          </div>
        )}

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
