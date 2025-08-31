import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://qovekbaewxxdzjzbcimc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmVrYmFld3h4ZHpqemJjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQ0NzY3NCwiZXhwIjoyMDYwMDIzNjc0fQ.Hs_LNx2kqb-tu8W6Kzl-q7J0D7yNj04KO-6S-Vfyvkw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function exportStorage() {
  try {
    console.log('Exporting Supabase storage...');

    // Create storage directory
    const storageDir = path.join(__dirname, '..', 'supabase-storage-export');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // List all buckets
    console.log('Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }

    console.log('Buckets found:', buckets.map(b => b.name));

    // Export each bucket
    for (const bucket of buckets) {
      console.log(`\nExporting bucket: ${bucket.name}`);
      
      const bucketDir = path.join(storageDir, bucket.name);
      if (!fs.existsSync(bucketDir)) {
        fs.mkdirSync(bucketDir, { recursive: true });
      }

      // List all files in bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list('', {
          limit: 1000,
          offset: 0
        });

      if (filesError) {
        console.error(`Error listing files in bucket ${bucket.name}:`, filesError);
        continue;
      }

      console.log(`Found ${files.length} files in bucket ${bucket.name}`);

      // Download each file
      for (const file of files) {
        if (file.name) {
          try {
            console.log(`Downloading: ${file.name}`);
            
            const { data, error } = await supabase.storage
              .from(bucket.name)
              .download(file.name);

            if (error) {
              console.error(`Error downloading ${file.name}:`, error);
              continue;
            }

            // Create directory structure
            const filePath = path.join(bucketDir, file.name);
            const fileDir = path.dirname(filePath);
            if (!fs.existsSync(fileDir)) {
              fs.mkdirSync(fileDir, { recursive: true });
            }

            // Save file
            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(filePath, buffer);
            
            console.log(`✅ Downloaded: ${file.name}`);
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
          }
        }
      }
    }

    console.log('\n✅ Storage export completed!');
    console.log(`Files saved to: ${storageDir}`);

  } catch (error) {
    console.error('Storage export failed:', error);
  }
}

exportStorage();
