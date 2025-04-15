
import { Order, Player } from "@/types";

// Define types for raw database models
export interface DbOrder {
  id: string;
  team_name?: string | null;
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
}

export interface DbCustomer {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  delivery_note?: string | null;
}

export interface DbPlayer {
  id: string;
  name: string | null;
  size: string;
  number: number;
  print_image: boolean | null;
  design_image: string | null;
}

export interface DbPrintConfig {
  id: string;
  font: string | null;
  back_material: string | null;
  back_color: string | null;
  front_material: string | null;
  front_color: string | null;
  sleeve_material: string | null;
  sleeve_color: string | null;
  leg_material: string | null;
  leg_color: string | null;
  font_file: string | null;
  logo_positions: any | null;
}

export interface DbProductLine {
  id: string;
  product: string;
  position: string;
  material: string;
  size: string;
  points: number | null;
  content: string | null;
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
 * Parse reference images from different formats
 */
export function parseReferenceImages(referenceImages: any): string[] {
  if (!referenceImages) return [];
  
  if (typeof referenceImages === 'string') {
    try {
      return JSON.parse(referenceImages);
    } catch {
      return [];
    }
  }
  
  if (Array.isArray(referenceImages)) {
    return referenceImages.filter(item => typeof item === 'string').map(String);
  }
  
  return [];
}

/**
 * Extracts team name from order data
 */
export function extractTeamName(order: DbOrder): string {
  if (order.team_name) return order.team_name;
  
  if (order.design_data && typeof order.design_data === 'object') {
    return (order.design_data as any)?.team_name || '';
  }
  
  return '';
}

/**
 * Converts a database order with related data to application Order model
 */
export function dbOrderToOrder(
  dbOrder: DbOrder, 
  customer?: DbCustomer, 
  players?: DbPlayer[], 
  productLines?: DbProductLine[],
  printConfig?: DbPrintConfig
): Order {
  // Parse reference images
  const refImages = parseReferenceImages(dbOrder.reference_images);
  
  // Get team name
  const teamName = extractTeamName(dbOrder);
  
  // Default print config if none provided
  const defaultPrintConfig = {
    id: dbOrder.id,
    font: 'Arial',
    backMaterial: 'In chuyển nhiệt',
    backColor: 'Đen',
    frontMaterial: 'In chuyển nhiệt',
    frontColor: 'Đen',
    sleeveMaterial: 'In chuyển nhiệt',
    sleeveColor: 'Đen',
    legMaterial: 'In chuyển nhiệt',
    legColor: 'Đen',
  };
  
  const processedPrintConfig = printConfig ? {
    id: printConfig.id,
    font: printConfig.font || 'Arial',
    backMaterial: printConfig.back_material || 'In chuyển nhiệt',
    backColor: printConfig.back_color || 'Đen',
    frontMaterial: printConfig.front_material || 'In chuyển nhiệt',
    frontColor: printConfig.front_color || 'Đen',
    sleeveMaterial: printConfig.sleeve_material || 'In chuyển nhiệt',
    sleeveColor: printConfig.sleeve_color || 'Đen',
    legMaterial: printConfig.leg_material || 'In chuyển nhiệt',
    legColor: printConfig.leg_color || 'Đen'
  } : defaultPrintConfig;
  
  // Process players
  const processedPlayers = players ? players.map(player => ({
    id: player.id,
    name: player.name || "",
    number: String(player.number),
    size: player.size as 'S' | 'M' | 'L' | 'XL',
    printImage: player.print_image || false
  })) : [];
  
  // Process product lines
  const processedProductLines = productLines ? productLines.map(line => ({
    id: line.id,
    product: line.product,
    position: line.position,
    material: line.material,
    size: line.size,
    points: line.points || 0,
    content: line.content || ''
  })) : [];

  // Create a valid Order object
  return {
    id: dbOrder.id,
    players: processedPlayers,
    printConfig: processedPrintConfig,
    productLines: processedProductLines,
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
    customerName: customer?.name || "Không xác định",
    customerPhone: customer?.phone || undefined,
    customerAddress: customer?.address || undefined,
    teamName
  };
}
