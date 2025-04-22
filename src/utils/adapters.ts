import { Order, Player, Logo, LogoPosition } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Define types for raw database models
export interface DbOrder {
  id: string;
  team_name?: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  design_data: any; // Using any here to accommodate various JSON structures
  reference_images: string[] | any;
  customer_id: string | null;
  total_cost: number;
  logo_url?: string | null; // This property may still exist in some old records
  logo_ids?: string[]; // New field to store logo_ids
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

export interface DbLogo {
  id: string;
  file_path: string;
  position: string;
  order_id: string;
  x_position?: number;
  y_position?: number;
  scale?: number;
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
    uniform_type: dbPlayer.uniform_type as 'player' | 'goalkeeper' || 'player',
    line_1: dbPlayer.line_1 || undefined,
    line_2: dbPlayer.line_2 || undefined,
    line_3: dbPlayer.line_3 || undefined,
    chest_number: dbPlayer.chest_number || false,
    pants_number: dbPlayer.pants_number || false,
    logo_chest_left: dbPlayer.logo_chest_left || false,
    logo_chest_right: dbPlayer.logo_chest_right || false,
    logo_chest_center: dbPlayer.logo_chest_center || false,
    logo_sleeve_left: dbPlayer.logo_sleeve_left || false,
    logo_sleeve_right: dbPlayer.logo_sleeve_right || false,
    logo_pants: dbPlayer.logo_pants || false,
    note: dbPlayer.note || undefined,
    print_style: dbPlayer.print_style || undefined
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
 * Process logos from database format
 */
export function processLogos(dbLogos: any[] | null): Logo[] {
  if (!dbLogos || !Array.isArray(dbLogos)) {
    console.log("No logos found or logos is not an array");
    return [];
  }

  // Enhanced logging for logo processing
  console.log(`Processing ${dbLogos.length} logos from database:`, dbLogos);
  
  // Filter out invalid logos first
  const validLogos = dbLogos.filter(logo => {
    if (!logo) {
      console.warn("Found null or undefined logo entry");
      return false;
    }
    
    if (!logo.position) {
      console.warn("Found logo without position:", logo);
      return false;
    }
    
    if (!logo.file_path && !logo.url && !logo.previewUrl) {
      console.warn("Found logo without file_path, url or previewUrl:", logo);
      return false;
    }
    
    return true;
  });

  console.log(`Found ${validLogos.length} valid logos after filtering`);
  
  return validLogos.map(logo => {
    // Use Supabase client to generate public URLs correctly
    let previewUrl: string | undefined = undefined;
    
    if (logo.file_path && typeof logo.file_path === "string") {
      try {
        // Use supabase client to generate proper URLs from the storage API
        const { data } = supabase.storage
          .from('logos')
          .getPublicUrl(logo.file_path.replace(/^logos\//, ""));
        
        previewUrl = data.publicUrl;
        console.log(`Generated public URL for logo ${logo.id}: ${previewUrl}`);
      } catch (error) {
        console.error("Error generating public URL for logo:", error);
        previewUrl = undefined;
      }
    } else if (logo.url) {
      previewUrl = logo.url;
      console.log(`Using existing URL for logo ${logo.id}: ${previewUrl}`);
    } else if (logo.previewUrl) {
      previewUrl = logo.previewUrl;
      console.log(`Using existing previewUrl for logo ${logo.id}: ${previewUrl}`);
    }
    
    return {
      id: logo.id ?? `logo-${logo.position}-${Date.now()}`,
      position: logo.position as LogoPosition,
      url: previewUrl,
      previewUrl: previewUrl,
      x_position: logo.x_position,
      y_position: logo.y_position,
      scale: logo.scale
    };
  });
}

/**
 * Helper to get public URL from storage path
 * This function is kept for backwards compatibility but no longer used
 */
function getPublicUrl(storagePath: string): string {
  try {
    // Use Supabase's built-in getPublicUrl method for reliable URL generation
    const cleanPath = storagePath.replace(/^logos\//, "");
    const { data } = supabase.storage.from('logos').getPublicUrl(cleanPath);
    return data.publicUrl;
  } catch (error) {
    console.error("Error generating public URL for path:", storagePath, error);
    return "";
  }
}

/**
 * Converts a database order with related data to application Order model
 */
export function dbOrderToOrder(
  dbOrder: any,
  customer?: any,
  players?: any[],
  productLines?: any[],
  printConfig?: any,
  logos?: any[]
): Order {
  // Parse reference images
  const refImages = parseReferenceImages(dbOrder.reference_images);

  // Get team name
  const teamName = extractTeamName(dbOrder);

  // Get logo_ids array if present
  const logoIds: string[] = Array.isArray(dbOrder.logo_ids)
    ? dbOrder.logo_ids.map(String)
    : [];

  // Process players data with error handling
  const processedPlayers = players ? players.map(player => {
    try {
      return dbPlayerToPlayer(player);
    } catch (error) {
      console.error("Error processing player data:", error, player);
      return null;
    }
  }).filter(Boolean) : [];

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
    legColor: 'Đen'
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

  // Process logos data from the logos table
  let processedLogos: Logo[] = [];
  if (logos && logos.length > 0) {
    console.log("Processing logos from logos table:", logos);
    processedLogos = processLogos(logos);
    console.log("Processed logos:", processedLogos);
  } else {
    console.log("No logos in dbOrderToOrder function");
  }

  // Create the Order object (remove logo_url and logo_urls references)
  return {
    id: dbOrder.id,
    players: processedPlayers,
    printConfig: processedPrintConfig,
    productLines: processedProductLines,
    totalCost: dbOrder.total_cost || 0,
    status: dbOrder.status as 'new' | 'processing' | 'completed' | 'delivered',
    createdAt: new Date(dbOrder.created_at),
    notes: dbOrder.notes || "",
    referenceImages: refImages,
    designData: dbOrder.design_data,
    customerId: dbOrder.customer_id,
    customerName: customer?.name || "Không xác định",
    customerPhone: customer?.phone || undefined,
    customerAddress: customer?.address || undefined,
    teamName,
    logos: processedLogos,
    logoIds // Using the logoIds property we added to the Order interface
  };
}
