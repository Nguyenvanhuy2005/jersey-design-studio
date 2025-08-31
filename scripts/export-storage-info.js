import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://qovekbaewxxdzjzbcimc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmVrYmFld3h4ZHpqemJjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQ0NzY3NCwiZXhwIjoyMDYwMDIzNjc0fQ.Hs_LNx2kqb-tu8W6Kzl-q7J0D7yNj04KO-6S-Vfyvkw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function exportStorageInfo() {
  try {
    console.log('Exporting storage information from database...');

    // Get files from logos table
    console.log('\nGetting logo files from database...');
    const { data: logos, error: logosError } = await supabase
      .from('logos')
      .select('*');

    if (logosError) {
      console.error('Error fetching logos:', logosError);
    } else {
      console.log(`Found ${logos.length} logos`);
      
      const logosFile = path.join(__dirname, '..', 'logos-info.json');
      fs.writeFileSync(logosFile, JSON.stringify(logos, null, 2));
      console.log(`Logos info saved to: ${logosFile}`);
    }

    // Get files from fonts table
    console.log('\nGetting font files from database...');
    const { data: fonts, error: fontsError } = await supabase
      .from('fonts')
      .select('*');

    if (fontsError) {
      console.error('Error fetching fonts:', fontsError);
    } else {
      console.log(`Found ${fonts.length} fonts`);
      
      const fontsFile = path.join(__dirname, '..', 'fonts-info.json');
      fs.writeFileSync(fontsFile, JSON.stringify(fonts, null, 2));
      console.log(`Fonts info saved to: ${fontsFile}`);
    }

    // Get orders with design images
    console.log('\nGetting orders with design images...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, design_image, design_image_front, design_image_back, reference_images');

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    } else {
      console.log(`Found ${orders.length} orders with design images`);
      
      const ordersFile = path.join(__dirname, '..', 'orders-images-info.json');
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
      console.log(`Orders images info saved to: ${ordersFile}`);
    }

    // Get players with design images
    console.log('\nGetting players with design images...');
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, design_image');

    if (playersError) {
      console.error('Error fetching players:', playersError);
    } else {
      console.log(`Found ${players.length} players with design images`);
      
      const playersFile = path.join(__dirname, '..', 'players-images-info.json');
      fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));
      console.log(`Players images info saved to: ${playersFile}`);
    }

    console.log('\n✅ Storage information export completed!');

  } catch (error) {
    console.error('Storage info export failed:', error);
  }
}

exportStorageInfo();
