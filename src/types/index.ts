
export interface Player {
  id?: string;
  name: string;
  number: number;
  size: 'S' | 'M' | 'L' | 'XL' | '1' | '2' | '3' | '4' | '5'; // Updated to allow numeric sizes
  printImage: boolean;
}

export type LogoPosition = 'chest_left' | 'chest_right' | 'chest_center' | 'sleeve_left' | 'sleeve_right' | 'pants';

export interface Logo {
  id?: string;
  file: File;
  position: LogoPosition;
  previewUrl: string;
}

export interface FontConfig {
  font: string;
  customFontFile?: File;
  customFontUrl?: string;
}

export interface PrintConfig {
  id?: string;
  fontText: FontConfig; // Changed to separate font for text
  fontNumber: FontConfig; // Changed to separate font for numbers
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

export interface PrintPositionConfig {
  content?: string;
  material?: string;
  color?: string;
  enabled?: boolean;
}

export interface DesignData {
  font_text: {
    font: string;
    font_file?: string;
  };
  font_number: {
    font: string;
    font_file?: string;
  };
  line_1?: PrintPositionConfig;
  line_2?: PrintPositionConfig;
  line_3?: PrintPositionConfig;
  chest_text?: PrintPositionConfig;
  chest_number?: PrintPositionConfig;
  pants_number?: PrintPositionConfig;
  pet_chest?: PrintPositionConfig;
  logo_chest_left?: {
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_chest_right?: {
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_chest_center?: {
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_sleeve_left?: {
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_sleeve_right?: {
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  logo_pants?: {
    logo_id?: string;
    x_position?: number;
    y_position?: number;
    scale?: number;
  };
  reference_images?: string[];
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
  | 'logo_pants'
  | 'number_sleeve_left'
  | 'number_sleeve_right'
  | 'number_chest_center'
  | 'chest_text'
  | 'pet_chest';

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
  logos?: Logo[];
  printConfig: PrintConfig;
  productLines: ProductLine[];
  totalCost: number;
  status: 'new' | 'processing' | 'completed';
  createdAt?: Date;
  notes?: string;
  designImage?: string;        // Legacy field - kept for backward compatibility
  designImageFront?: string;   // Front design image path
  designImageBack?: string;    // Back design image path
  referenceImages: string[];   // Using string[] to match what we're transforming data to
  designData?: DesignData;     // Added to match the Supabase structure
}
