import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://qovekbaewxxdzjzbcimc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmVrYmFld3h4ZHpqemJjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQ0NzY3NCwiZXhwIjoyMDYwMDIzNjc0fQ.Hs_LNx2kqb-tu8W6Kzl-q7J0D7yNj04KO-6S-Vfyvkw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function downloadStorageFiles() {
  try {
    console.log('Downloading storage files...');

    // Create storage directory
    const storageDir = path.join(__dirname, '..', 'supabase-storage-files');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Read logos info
    const logosInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'logos-info.json'), 'utf8'));
    console.log(`Found ${logosInfo.length} logos to download`);

    // Download logos
    const logosDir = path.join(storageDir, 'logos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    let downloadedLogos = 0;
    for (const logo of logosInfo) {
      if (logo.file_path) {
        try {
          console.log(`Downloading logo: ${logo.file_path}`);
          
          // Try different buckets
          const buckets = ['logos', 'Design Images', 'Reference Images'];
          let downloaded = false;
          
          for (const bucket of buckets) {
            try {
              const { data, error } = await supabase.storage
                .from(bucket)
                .download(logo.file_path);

              if (!error && data) {
                const filePath = path.join(logosDir, logo.file_path);
                const fileDir = path.dirname(filePath);
                if (!fs.existsSync(fileDir)) {
                  fs.mkdirSync(fileDir, { recursive: true });
                }

                const arrayBuffer = await data.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(filePath, buffer);
                
                console.log(`✅ Downloaded logo: ${logo.file_path} from bucket: ${bucket}`);
                downloaded = true;
                downloadedLogos++;
                break;
              }
            } catch (bucketError) {
              console.log(`Failed to download from bucket ${bucket}: ${bucketError.message}`);
            }
          }
          
          if (!downloaded) {
            console.log(`❌ Failed to download logo: ${logo.file_path}`);
          }
        } catch (error) {
          console.error(`Error downloading logo ${logo.file_path}:`, error.message);
        }
      }
    }

    // Read fonts info
    const fontsInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fonts-info.json'), 'utf8'));
    console.log(`\nFound ${fontsInfo.length} fonts to download`);

    // Download fonts
    const fontsDir = path.join(storageDir, 'fonts');
    if (!fs.existsSync(fontsDir)) {
      fs.mkdirSync(fontsDir, { recursive: true });
    }

    let downloadedFonts = 0;
    for (const font of fontsInfo) {
      if (font.file_path) {
        try {
          console.log(`Downloading font: ${font.file_path}`);
          
          const { data, error } = await supabase.storage
            .from('fonts')
            .download(font.file_path);

          if (!error && data) {
            const filePath = path.join(fontsDir, font.file_path);
            const fileDir = path.dirname(filePath);
            if (!fs.existsSync(fileDir)) {
              fs.mkdirSync(fileDir, { recursive: true });
            }

            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(filePath, buffer);
            
            console.log(`✅ Downloaded font: ${font.file_path}`);
            downloadedFonts++;
          } else {
            console.log(`❌ Failed to download font: ${font.file_path}`);
          }
        } catch (error) {
          console.error(`Error downloading font ${font.file_path}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Download completed!`);
    console.log(`Downloaded ${downloadedLogos} logos and ${downloadedFonts} fonts`);
    console.log(`Files saved to: ${storageDir}`);

  } catch (error) {
    console.error('Download failed:', error);
  }
}

downloadStorageFiles();
