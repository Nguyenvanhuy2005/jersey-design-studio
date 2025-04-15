
import { Order, Player } from "@/types";

// Define types for raw database models
export interface DbOrder {
  id: string;
  team_name: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  design_data: any; // Using any here to accommodate various JSON structures
  design_image: string | null;
  design_image_front: string | null;
  design_image_back: string | null;
  reference_images: string[] | any;
  customer_id: string | null;
  total_cost: number;
  logo_url?: string | null;
  customers?: any; // For joined customer data
  
  // The following fields are now expected to be part of the JSONB data in the database
  // They are optional in the type to handle both old and new data structures
  players?: any; // For JSONB arrays in the new structure
  logos?: any; // For JSONB arrays in the new structure
  product_lines?: any; // For JSONB arrays in the new structure
  print_config?: any; // For JSONB object in the new structure
  players_count?: number; // Added for new schema
  completed_at?: string; // Added for new schema
}

export interface DbPlayer {
  id: string;
  name: string | null;
  size: string;
  number: number;
  print_image: boolean | null;
  design_image: string | null;
}

/**
 * Converts a database player to application Player model
 */
export function dbPlayerToPlayer(dbPlayer: DbPlayer): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name || "",
    // Convert number to string for the application model
    number: String(dbPlayer.number),
    size: dbPlayer.size as 'S' | 'M' | 'L' | 'XL',
    printImage: dbPlayer.print_image || false,
  };
}

/**
 * Converts a database order to application Order model
 * This function has been updated to handle the new database schema with JSONB fields
 */
export function dbOrderToOrder(dbOrder: DbOrder): Order {
  // Parse players from JSONB or direct array
  let players: Player[] = [];
  if (dbOrder.players) {
    if (Array.isArray(dbOrder.players)) {
      players = dbOrder.players.map((p: any) => ({
        id: p.id || '',
        name: p.name || "",
        number: String(p.number || 0),
        size: p.size as 'S' | 'M' | 'L' | 'XL' | '1' | '3' | '5' | '7' | '9' | '11' | '13' | '15' | '2XL' | '3XL' | '4XL',
        printImage: p.print_image || false,
      }));
    }
  }

  // Parse reference images
  let refImages: string[] = [];
  if (dbOrder.reference_images) {
    if (typeof dbOrder.reference_images === 'string') {
      try {
        refImages = JSON.parse(dbOrder.reference_images);
      } catch (e) {
        refImages = [];
      }
    } else if (Array.isArray(dbOrder.reference_images)) {
      refImages = dbOrder.reference_images.filter(item => typeof item === 'string').map(item => String(item));
    }
  }

  // Parse product lines from JSONB
  let productLines: any[] = [];
  if (dbOrder.product_lines) {
    if (Array.isArray(dbOrder.product_lines)) {
      productLines = dbOrder.product_lines.map((pl: any) => ({
        id: pl.id || '',
        product: pl.product || "",
        position: pl.position || "",
        material: pl.material || "",
        size: pl.size || "",
        points: pl.points || 0,
        content: pl.content || ""
      }));
    }
  }

  // Parse print config from JSONB or use defaults
  const printConfig = dbOrder.print_config || {
    font: "Arial",
    backMaterial: "In chuyển nhiệt",
    backColor: "Đen",
    frontMaterial: "In chuyển nhiệt",
    frontColor: "Đen",
    sleeveMaterial: "In chuyển nhiệt",
    sleeveColor: "Đen",
    legMaterial: "In chuyển nhiệt",
    legColor: "Đen"
  };

  // Extract customer data if available
  let customerName = undefined;
  let customerEmail = undefined;
  let customerPhone = undefined;
  let customerAddress = undefined;

  if (dbOrder.customers) {
    customerName = dbOrder.customers.name;
    customerEmail = dbOrder.customers.email;
    customerPhone = dbOrder.customers.phone;
    customerAddress = dbOrder.customers.address;
  }

  // Get team name from order data or design data
  let teamName = dbOrder.team_name || '';
  if (!teamName && dbOrder.design_data?.team_name) {
    teamName = dbOrder.design_data.team_name;
  }

  // Create a valid Order object
  return {
    id: dbOrder.id,
    players: players,
    printConfig: {
      id: dbOrder.id,
      font: printConfig.font || "Arial",
      backMaterial: printConfig.back_material || printConfig.backMaterial || "In chuyển nhiệt",
      backColor: printConfig.back_color || printConfig.backColor || "Đen",
      frontMaterial: printConfig.front_material || printConfig.frontMaterial || "In chuyển nhiệt",
      frontColor: printConfig.front_color || printConfig.frontColor || "Đen",
      sleeveMaterial: printConfig.sleeve_material || printConfig.sleeveMaterial || "In chuyển nhiệt",
      sleeveColor: printConfig.sleeve_color || printConfig.sleeveColor || "Đen",
      legMaterial: printConfig.leg_material || printConfig.legMaterial || "In chuyển nhiệt",
      legColor: printConfig.leg_color || printConfig.legColor || "Đen",
    },
    productLines: productLines,
    totalCost: dbOrder.total_cost || 0,
    status: dbOrder.status as 'new' | 'processing' | 'completed',
    createdAt: new Date(dbOrder.created_at),
    notes: dbOrder.notes || "",
    designImage: dbOrder.design_image || undefined,
    designImageFront: dbOrder.design_image_front || undefined,
    designImageBack: dbOrder.design_image_back || undefined,
    referenceImages: refImages,
    designData: dbOrder.design_data,
    customerId: dbOrder.customer_id,
    customerName: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    customerAddress: customerAddress,
    teamName: teamName || dbOrder.design_data?.team_name || ""
  };
}
