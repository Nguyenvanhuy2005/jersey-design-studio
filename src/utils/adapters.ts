
import { Order, Player } from "@/types";

// Define types for raw database models
export interface DbOrder {
  id: string;
  team_name: string | null;
  logo_url: string | null;
  total_cost: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  design_data: any; // Using any here to accommodate various JSON structures
  design_image: string | null;
  reference_images: any;
  design_image_front: string | null;
  design_image_back: string | null;
  customer_id: string | null;
  players?: DbPlayer[];
}

export interface DbPlayer {
  id: string;
  name: string | null;
  size: string;
  number: number;
  order_id: string | null;
  created_at: string | null;
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
  // Convert players if available
  const players = dbOrder.players ? dbOrder.players.map(dbPlayerToPlayer) : [];
  
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

  // Create a valid Order object
  return {
    id: dbOrder.id,
    teamName: dbOrder.team_name || "",
    players: players,
    printConfig: {
      id: dbOrder.id,
      font: "Arial",
      backMaterial: "In chuyển nhiệt",
      backColor: "Đen",
      frontMaterial: "In chuyển nhiệt",
      frontColor: "Đen",
      sleeveMaterial: "In chuyển nhiệt",
      sleeveColor: "Đen",
      legMaterial: "In chuyển nhiệt",
      legColor: "Đen",
    },
    productLines: [],
    totalCost: dbOrder.total_cost || 0,
    status: dbOrder.status as 'new' | 'processing' | 'completed',
    createdAt: dbOrder.created_at ? new Date(dbOrder.created_at) : new Date(),
    notes: dbOrder.notes || "",
    designImage: dbOrder.design_image || undefined,
    designImageFront: dbOrder.design_image_front || undefined,
    designImageBack: dbOrder.design_image_back || undefined,
    referenceImages: refImages,
    designData: dbOrder.design_data,
  };
}
