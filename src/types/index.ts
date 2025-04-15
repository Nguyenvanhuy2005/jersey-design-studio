export interface Player {
  id: string;
  name: string;
  number: string;
  size: 'S' | 'M' | 'L' | 'XL';
  printImage: boolean;
  imageFront?: string;
  imageBack?: string;
}

export interface Logo {
  id: string;
  url: string;
  position: 'chest_left' | 'chest_right' | 'chest_center' | 'sleeve_left' | 'sleeve_right' | 'pants';
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

export interface DesignData {
  uniform_type: 'player' | 'goalkeeper';
  chest_number: {
    enabled: boolean;
    color: 'Đen' | 'Trắng' | 'Đỏ' | 'Xanh';
  };
  chest_text: {
    enabled: boolean;
    content: string;
    color: 'Đen' | 'Trắng' | 'Đỏ' | 'Xanh';
  };
  logo_chest_left: {
    enabled: boolean;
  };
  logo_chest_right: {
    enabled: boolean;
  };
  logo_chest_center: {
    enabled: boolean;
  };
  logo_sleeve_left: {
    enabled: boolean;
  };
  logo_sleeve_right: {
    enabled: boolean;
  };
  font_text: {
    font: string;
  };
  font_number: {
    font: string;
  };
}

export interface Customer {
  id?: string;
  name: string;
  address: string;
  phone: string;
  delivery_note?: string;
  created_at?: Date;
}

export interface Order {
  id: string;
  teamName: string;
  players: Player[];
  productLines: ProductLine[];
  printConfig: PrintConfig;
  totalCost: number;
  status: 'new' | 'processing' | 'completed';
  createdAt?: Date;
  notes?: string;
  designImage?: string;
  designImageFront?: string;
  designImageBack?: string;
  referenceImages?: string[];
  customerName?: string;    // Added customer name
  customerId?: string;      // Added customer id
}
