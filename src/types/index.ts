
export interface Player {
  id?: string;
  name: string;
  number: number;
  size: 'S' | 'M' | 'L' | 'XL';
  printImage: boolean;
  // Removed design_image field as per requirements
}

export type LogoPosition = 'chest_left' | 'chest_right' | 'chest_center' | 'sleeve_left' | 'sleeve_right';

export interface Logo {
  id?: string;
  file: File;
  position: LogoPosition;
  previewUrl: string;
}

export interface PrintConfig {
  id?: string;
  font: string;
  customFontFile?: File;
  customFontUrl?: string;
  backMaterial: string;
  backColor: string;
  frontMaterial: string;
  frontColor: string;
  sleeveMaterial: string;
  sleeveColor: string;
  legMaterial: string;
  legColor: string;
}

export type PrintPosition = 
  | 'pants_number' 
  | 'back_number' 
  | 'above_back_number' 
  | 'below_back_number'
  | 'logo_sleeve_left'
  | 'logo_sleeve_right'
  | 'logo_chest_left'
  | 'logo_chest_right'
  | 'logo_chest_center'
  | 'number_sleeve_left'
  | 'number_sleeve_right'
  | 'number_chest_center';

export interface ProductLine {
  id: string;
  product: string;
  position: string;
  material: string;
  size: string;
  points: number;
  content: string;
}

export interface DesignData {
  logos?: Array<{
    logo_id: string;
    position: string;
    x_position: number;
    y_position: number;
    scale: number;
  }>;
  player_name?: {
    position: string;
    content: string;
    font: string;
    font_file?: string;
    color: string;
    material: string;
  };
  player_number?: {
    position: string;
    content: string;
    font: string;
    font_file?: string;
    color: string;
    material: string;
  };
  reference_images?: string[];
}

export interface Order {
  id?: string;
  teamName: string;
  players: Player[];
  logos?: Logo[];
  printConfig: PrintConfig;
  productLines: ProductLine[];
  totalCost: number;
  status: 'new' | 'processing' | 'completed';
  createdAt?: Date;
  notes?: string;
  designImage?: string;
  referenceImages?: string[]; // This needs to be string[] to match the expected type
}
