import type { DistrictCode } from "../lib/types";

export const DISTRICTS: { code: DistrictCode; label: string }[] = [
  { code: "CENTER", label: "Центр" },
  { code: "ZHM", label: "ЗЖМ" },
  { code: "SZHM", label: "СЖМ" },
  { code: "NAKHICHEVAN", label: "Нахичевань" },
  { code: "ALEXANDROVKA", label: "Александровка" },
  { code: "SELMASH", label: "Сельмаш" },
  { code: "VOENVED", label: "Военвед" },
  { code: "LEVENTSOVKA", label: "Левенцовка" },
  { code: "SUVOROVSKY", label: "Суворовский" },
  { code: "KRASNY_AKSAY", label: "Красный Аксай" },
];

export function districtLabel(code: string): string {
  return DISTRICTS.find((d) => d.code === code)?.label ?? code;
}
