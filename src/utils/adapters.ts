import { Order, Player, Logo, LogoPosition } from "@/types";

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
  if (!dbLogos || !Array.isArray(dbLogos)) return [];
  return dbLogos
    .filter(logo => logo && logo.file_path && logo.position)
    .map(logo => {
      // file_path luôn trỏ tới storage, tạo public url dựa vào vị trí và path
      let previewUrl: string | undefined = undefined;
      if (logo.file_path && typeof logo.file_path === "string") {
        previewUrl = getPublicUrl(logo.file_path);
      }
      return {
        id: logo.id ?? `logo-${logo.position}-${logo.file_path}`,
        position: logo.position as LogoPosition,
        url: previewUrl,
        previewUrl: previewUrl
      };
    });
}

/**
 * Helper to get public URL from storage path
 */
function getPublicUrl(storagePath: string): string {
  const baseUrl = "https://vvfxqlqcfibxstnjciha.supabase.co/storage/v1/object/public";
  const bucket = "logos";
  // Remove leading slash or "logos/" if present
  let cleanPath = storagePath.replace(/^logos\//, "");
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
  return `${baseUrl}/${bucket}/${cleanPath}`;
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

  // Enhanced logo processing:
  // Try to merge URLs from logo_urls array with positions in logos table if available.
  let processedLogos: Logo[] = [];
  if (Array.isArray(dbOrder.logo_urls) && dbOrder.logo_urls.length > 0) {
    // Use info from both logo_urls and logos params if available
    const logoUrlArr: string[] = dbOrder.logo_urls;
    if (Array.isArray(logos) && logos.length > 0) {
      // Try to find matching logo table records by file_path/url substring, else fallback
      processedLogos = logoUrlArr.map((url: string, idx: number) => {
        // Find a logos table record whose file_path ends with the part from this URL
        const matchedLogo = logos.find((lg) => {
          // Both file_path in DB and url should contain the unique filename
          if (!lg?.file_path || !url) return false;
          // Check if the file_path is included in the URL
          return url.includes(lg.file_path);
        });
        return {
          id: matchedLogo?.id ?? `logo_${idx}`,
          position: matchedLogo?.position as LogoPosition | undefined,
          url,
          previewUrl: url,
        };
      });
    } else {
      // Only urls, show all but positions are undefined
      processedLogos = logoUrlArr.map((url: string, idx: number) => ({
        id: `logo_${idx}`,
        position: undefined,
        url,
        previewUrl: url
      }));
    }
  } else if (logos && logos.length > 0) {
    // No logo_urls array, use logo table records only
    processedLogos = processLogos(logos);
  }

  // Create the Order object
  return {
    id: dbOrder.id,
    players: processedPlayers,
    printConfig: processedPrintConfig,
    productLines: processedProductLines,
    totalCost: dbOrder.total_cost || 0,
    status: dbOrder.status as 'new' | 'processing' | 'completed',
    createdAt: new Date(dbOrder.created_at),
    notes: dbOrder.notes || "",
    referenceImages: refImages,
    designData: dbOrder.design_data,
    customerId: dbOrder.customer_id,
    customerName: customer?.name || "Không xác định",
    customerPhone: customer?.phone || undefined,
    customerAddress: customer?.address || undefined,
    teamName,
    logo_url: dbOrder.logo_url || undefined,
    logos: processedLogos
  };
}
