
export interface Player {
  id?: string;
  name: string;
  number: number;
  size: 'S' | 'M' | 'L' | 'XL';
  printImage: boolean;
}

export type LogoPosition = 'chest_left' | 'chest_right' | 'chest_center' | 'sleeve_left' | 'sleeve_right' | 'pants';

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

// Added new types for print positions
export type PrintPosition = 
  | 'pants_number' 
  | 'back_number' 
  | 'above_back_number' 
  | 'below_back_number'
  | 'chest_text'
  | 'chest_number'
  | 'logo_sleeve_left'
  | 'logo_sleeve_right'
  | 'logo_chest_left'
  | 'logo_chest_right'
  | 'logo_chest_center'
  | 'logo_pants'
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

// New interface for fixed print positions
export interface PrintPositionConfig {
  enabled: boolean;
  material?: string;
  color?: string;
  content?: string;
}

// Interface for logo position configurations
export interface LogoPositionConfig extends PrintPositionConfig {
  logo_id?: string;
  x_position?: number;
  y_position?: number;
  scale?: number;
}

// Updated DesignData to match new requirements
export interface DesignData {
  uniform_type?: 'player' | 'goalkeeper';
  quantity?: number;
  logos?: Array<{
    logo_id: string;
    position: string;
    x_position: number;
    y_position: number;
    scale: number;
  }>;
  line_1?: PrintPositionConfig & {
    font?: string;
    font_file?: string;
  };
  line_2?: PrintPositionConfig & {
    font?: string;
    font_file?: string;
  };
  line_3?: PrintPositionConfig & {
    font?: string;
    font_file?: string;
  };
  chest_text?: PrintPositionConfig & {
    font?: string;
    font_file?: string;
  };
  chest_number?: PrintPositionConfig;
  pants_number?: PrintPositionConfig;
  logo_chest_left?: LogoPositionConfig;
  logo_chest_right?: LogoPositionConfig;
  logo_chest_center?: LogoPositionConfig;
  logo_sleeve_left?: LogoPositionConfig;
  logo_sleeve_right?: LogoPositionConfig;
  pet_chest?: PrintPositionConfig;
  logo_pants?: LogoPositionConfig;
  font_text?: {
    font: string;
    font_file?: string;
  };
  font_number?: {
    font: string;
    font_file?: string;
  };
  reference_images?: string[];
}

// New interface for customer information
export interface Customer {
  id?: string;
  name: string;
  address: string;
  phone: string;
  delivery_note?: string;
  created_at?: Date;
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
  customer_id?: string;        // Reference to the customer who placed the order
  designData?: DesignData;     // New field to store all design-related data
  uniform_type?: 'player' | 'goalkeeper';
  quantity?: number;
}
