export interface Player {
  id: string;
  name: string;
  number: string;
  size: 'S' | 'M' | 'L' | 'XL' | '1' | '3' | '5' | '7' | '9' | '11' | '13' | '15' | '2XL' | '3XL' | '4XL';
  printImage: boolean;
  uniform_type?: 'player' | 'goalkeeper';
  line_1?: string;
  line_2?: string;
  line_3?: string;
  chest_number?: boolean;
  pants_number?: boolean;
  logo_chest_left?: boolean;
  logo_chest_right?: boolean;
  logo_chest_center?: boolean;
  logo_sleeve_left?: boolean;
  logo_sleeve_right?: boolean;
  logo_pants?: boolean;
  note?: string;
  print_style?: string;
}

export type LogoPosition = 'chest_left' | 'chest_right' | 'chest_center' | 'sleeve_left' | 'sleeve_right' | 'pants';

export type UniformSize = 'S' | 'M' | 'L' | 'XL' | '1' | '3' | '5' | '7' | '9' | '11' | '13' | '15' | '2XL' | '3XL' | '4XL';

export interface Logo {
  id: string;
  url?: string;
  position: LogoPosition;
  file?: File;
  previewUrl?: string;
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
  customFontFile?: File;
  customFontUrl?: string;
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

export interface PrintPositionConfig {
  enabled: boolean;
  material?: string;
  content?: string;
  font?: string;
}

export interface LogoPositionConfig {
  enabled: boolean;
  material?: string;
  logo_id?: string;
  x_position?: number;
  y_position?: number;
  scale?: number;
}

export interface DesignData {
  uniform_type: 'player' | 'goalkeeper' | 'mixed';
  quantity?: number;
  chest_number: {
    enabled: boolean;
    material?: string;
  };
  chest_text: {
    enabled: boolean;
    content: string;
    material?: string;
    font?: string;
  };
  logo_chest_left: {
    enabled: boolean;
    material?: string;
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_chest_right: {
    enabled: boolean;
    material?: string;
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_chest_center: {
    enabled: boolean;
    material?: string;
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_sleeve_left: {
    enabled: boolean;
    material?: string;
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_sleeve_right: {
    enabled: boolean;
    material?: string;
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_pants: {
    enabled: boolean;
    material?: string;
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  font_text: {
    font: string;
    font_file?: string;
  };
  font_number: {
    font: string;
    font_file?: string;
  };
  line_1?: {
    enabled: boolean;
    content: string;
    material?: string;
    font?: string;
  };
  line_2?: {
    enabled: boolean;
    content?: string;
    material?: string;
    font?: string;
  };
  line_3?: {
    enabled: boolean;
    content: string;
    material?: string;
    font?: string;
  };
  pants_number?: {
    enabled: boolean;
    material?: string;
  };
  reference_images?: string[];
  print_style?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  delivery_note?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  players: Player[];
  productLines: ProductLine[];
  printConfig: PrintConfig;
  totalCost: number;
  status: 'new' | 'processing' | 'completed';
  createdAt?: Date;
  notes?: string;
  referenceImages?: string[];
  customerName?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  designData?: any;
  user_id?: string;
  teamName?: string;
}

export interface DbPlayer {
  id: string;
  name: string | null;
  size: string;
  number: number;
  print_image: boolean | null;
  uniform_type: string | null;
  line_1: string | null;
  line_2: string | null;
  line_3: string | null;
  chest_number: boolean | null;
  pants_number: boolean | null;
  logo_chest_left: boolean | null;
  logo_chest_right: boolean | null;
  logo_chest_center: boolean | null;
  logo_sleeve_left: boolean | null;
  logo_sleeve_right: boolean | null;
  logo_pants: boolean | null;
  note: string | null;
  print_style: string | null;
}
