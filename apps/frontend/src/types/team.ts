export interface TeamMember {
  id: string;
  name: string;
  role: string;
  since: string; // "2018", "2020", etc.
  imageUrl: string;
  linkedIn?: string;
  instagram?: string;
}
