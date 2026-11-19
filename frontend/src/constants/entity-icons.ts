import { Building2, Cpu, MapPin, Package, RadioTower, Truck, type LucideIcon } from "lucide-react";
import type { EntityTypeIcon } from "@/types/entity-type.types";

/** Pemetaan nama ikon dari backend ke ikon lucide. */
export const ENTITY_TYPE_ICONS: Record<EntityTypeIcon, LucideIcon> = {
  truck: Truck,
  cpu: Cpu,
  building: Building2,
  pin: MapPin,
  box: Package,
  radio: RadioTower,
};

export const ENTITY_TYPE_ICON_LABEL: Record<EntityTypeIcon, string> = {
  truck: "Truk",
  cpu: "Chip",
  building: "Gedung",
  pin: "Pin",
  box: "Paket",
  radio: "Sinyal",
};

/** Ikon cadangan kalau jenis entitas tidak ditemukan. */
export const FALLBACK_TYPE_ICON: LucideIcon = MapPin;
