export const DISTRICTS = [
  { code: "CENTER", label: "Центр", lat: 47.2225, lng: 39.7187 },
  { code: "ZHM", label: "ЗЖМ", lat: 47.2514, lng: 39.6244 },
  { code: "SZHM", label: "СЖМ", lat: 47.2694, lng: 39.7011 },
  { code: "NAKHICHEVAN", label: "Нахичевань", lat: 47.2219, lng: 39.7524 },
  { code: "ALEXANDROVKA", label: "Александровка", lat: 47.1973, lng: 39.8312 },
  { code: "SELMASH", label: "Сельмаш", lat: 47.2644, lng: 39.758 },
  { code: "VOENVED", label: "Военвед", lat: 47.2458, lng: 39.6875 },
  { code: "LEVENTSOVKA", label: "Левенцовка", lat: 47.2504, lng: 39.6056 },
  { code: "SUVOROVSKY", label: "Суворовский", lat: 47.2856, lng: 39.6513 },
  { code: "KRASNY_AKSAY", label: "Красный Аксай", lat: 47.2089, lng: 39.641 },
] as const;

export function districtCenter(code: string) {
  return DISTRICTS.find((d) => d.code === code) ?? DISTRICTS[0];
}
