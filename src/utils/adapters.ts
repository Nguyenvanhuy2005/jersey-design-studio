
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
  reference_images: any;
  customer_id: string | null;
  total_cost: number;
  players: any; // JSONB array in the new structure
  logos: any; // JSONB array in the new structure
  product_lines: any; // JSONB array in the new structure
  print_config: any; // JSONB object in the new structure
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
 */
export function dbOrderToOrder(dbOrder: DbOrder): Order {
  // Parse players from JSONB
  let players: Player[] = [];
  if (dbOrder.players && Array.isArray(dbOrder.players)) {
    players = dbOrder.players.map((p: any) => ({
      id: p.id,
      name: p.name || "",
      number: String(p.number),
      size: p.size as 'S' | 'M' | 'L' | 'XL',
      printImage: p.print_image || false,
    }));
  }

  // Parse reference images
  let refImages: string[] = [];
  if (typeof dbOrder.reference_images === 'string') {
    try {
      refImages = JSON.parse(dbOrder.reference_images);
    } catch (e) {
      refImages = [];
    }
  } else if (Array.isArray(dbOrder.reference_images)) {
    refImages = dbOrder.reference_images;
  }

  // Parse product lines from JSONB
  let productLines: any[] = [];
  if (dbOrder.product_lines && Array.isArray(dbOrder.product_lines)) {
    productLines = dbOrder.product_lines.map((pl: any) => ({
      id: pl.id,
      product: pl.product || "",
      position: pl.position || "",
      material: pl.material || "",
      size: pl.size || "",
      points: pl.points || 0,
      content: pl.content || ""
    }));
  }

  // Parse print config from JSONB
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

  // Create a valid Order object
  return {
    id: dbOrder.id,
    teamName: dbOrder.team_name || "",
    players: players,
    printConfig: {
      id: dbOrder.id,
      font: printConfig.font || "Arial",
      backMaterial: printConfig.back_material || "In chuyển nhiệt",
      backColor: printConfig.back_color || "Đen",
      frontMaterial: printConfig.front_material || "In chuyển nhiệt",
      frontColor: printConfig.front_color || "Đen",
      sleeveMaterial: printConfig.sleeve_material || "In chuyển nhiệt",
      sleeveColor: printConfig.sleeve_color || "Đen",
      legMaterial: printConfig.leg_material || "In chuyển nhiệt",
      legColor: printConfig.leg_color || "Đen",
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
    customerId: dbOrder.customer_id
  };
}
