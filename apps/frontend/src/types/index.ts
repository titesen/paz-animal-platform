import { LucideIcon } from "lucide-react";

export interface Pet {
  id: number;
  name: string;
  age: string;
  type: string;
  badge: string;
  imageUrl: string;
  description: string;
  status?: "ADOPTABLE" | "LOST";
  lastSeenZone?: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  linkText: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  isPaid: boolean;
  location: string;
}

export interface Sponsor {
  id: number;
  name: string;
  logoUrl: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  since: string; // "2018", "2020", etc.
  imageUrl: string;
  linkedIn?: string;
  instagram?: string;
}
