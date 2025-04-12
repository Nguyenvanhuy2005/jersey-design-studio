
export interface Player {
  id?: string;
  name: string;
  number: number;
  size: 'S' | 'M' | 'L' | 'XL';
  printImage: boolean;
}

export interface PrintConfig {
  id?: string;
  font: string;
  backMaterial: string;
  backColor: string;
  frontMaterial: string;
  frontColor: string;
  sleeveMaterial: string;
  sleeveColor: string;
  legMaterial: string;
  legColor: string;
}

export interface ProductLine {
  id: string;
  product: string;
  position: string;
  material: string;
  size: string;
  points: number;
  content: string;
}

export interface Order {
  id?: string;
  teamName: string;
  players: Player[];
  logoUrl?: string;
  printConfig: PrintConfig;
  productLines: ProductLine[];
  totalCost: number;
  status: 'new' | 'processing' | 'completed';
  createdAt?: Date;
  notes?: string;
}
