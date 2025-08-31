import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://qovekbaewxxdzjzbcimc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmVrYmFld3h4ZHpqemJjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQ0NzY3NCwiZXhwIjoyMDYwMDIzNjc0fQ.Hs_LNx2kqb-tu8W6Kzl-q7J0D7yNj04KO-6S-Vfyvkw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration from Supabase to local PostgreSQL...');

    // Migrate customers
    console.log('Migrating customers...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
    
    if (customersError) {
      console.error('Error fetching customers:', customersError);
    } else {
      for (const customer of customers) {
        await prisma.customer.upsert({
          where: { id: customer.id },
          update: customer,
          create: customer
        });
      }
      console.log(`Migrated ${customers.length} customers`);
    }

    // Migrate orders
    console.log('Migrating orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    } else {
      for (const order of orders) {
        await prisma.order.upsert({
          where: { id: order.id },
          update: order,
          create: order
        });
      }
      console.log(`Migrated ${orders.length} orders`);
    }

    // Migrate players
    console.log('Migrating players...');
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error('Error fetching players:', playersError);
    } else {
      for (const player of players) {
        await prisma.player.upsert({
          where: { id: player.id },
          update: player,
          create: player
        });
      }
      console.log(`Migrated ${players.length} players`);
    }

    // Migrate logos
    console.log('Migrating logos...');
    const { data: logos, error: logosError } = await supabase
      .from('logos')
      .select('*');
    
    if (logosError) {
      console.error('Error fetching logos:', logosError);
    } else {
      for (const logo of logos) {
        await prisma.logo.upsert({
          where: { id: logo.id },
          update: logo,
          create: logo
        });
      }
      console.log(`Migrated ${logos.length} logos`);
    }

    // Migrate print configs
    console.log('Migrating print configs...');
    const { data: printConfigs, error: printConfigsError } = await supabase
      .from('print_configs')
      .select('*');
    
    if (printConfigsError) {
      console.error('Error fetching print configs:', printConfigsError);
    } else {
      for (const config of printConfigs) {
        await prisma.printConfig.upsert({
          where: { id: config.id },
          update: config,
          create: config
        });
      }
      console.log(`Migrated ${printConfigs.length} print configs`);
    }

    // Migrate product lines
    console.log('Migrating product lines...');
    const { data: productLines, error: productLinesError } = await supabase
      .from('product_lines')
      .select('*');
    
    if (productLinesError) {
      console.error('Error fetching product lines:', productLinesError);
    } else {
      for (const productLine of productLines) {
        await prisma.productLine.upsert({
          where: { id: productLine.id },
          update: productLine,
          create: productLine
        });
      }
      console.log(`Migrated ${productLines.length} product lines`);
    }

    // Migrate sizes
    console.log('Migrating sizes...');
    const { data: sizes, error: sizesError } = await supabase
      .from('sizes')
      .select('*');
    
    if (sizesError) {
      console.error('Error fetching sizes:', sizesError);
    } else {
      for (const size of sizes) {
        await prisma.size.upsert({
          where: { sizeId: size.size_id },
          update: {
            sizeId: size.size_id,
            sizeValue: size.size_value,
            category: size.category,
            description: size.description,
            createdAt: size.created_at
          },
          create: {
            sizeId: size.size_id,
            sizeValue: size.size_value,
            category: size.category,
            description: size.description,
            createdAt: size.created_at
          }
        });
      }
      console.log(`Migrated ${sizes.length} sizes`);
    }

    // Migrate fonts
    console.log('Migrating fonts...');
    const { data: fonts, error: fontsError } = await supabase
      .from('fonts')
      .select('*');
    
    if (fontsError) {
      console.error('Error fetching fonts:', fontsError);
    } else {
      for (const font of fonts) {
        await prisma.font.upsert({
          where: { id: font.id },
          update: font,
          create: font
        });
      }
      console.log(`Migrated ${fonts.length} fonts`);
    }

    // Migrate delivery information
    console.log('Migrating delivery information...');
    const { data: deliveryInfo, error: deliveryInfoError } = await supabase
      .from('delivery_information')
      .select('*');
    
    if (deliveryInfoError) {
      console.error('Error fetching delivery information:', deliveryInfoError);
    } else {
      for (const info of deliveryInfo) {
        await prisma.deliveryInformation.upsert({
          where: { id: info.id },
          update: info,
          create: info
        });
      }
      console.log(`Migrated ${deliveryInfo.length} delivery information records`);
    }

    // Migrate user roles
    console.log('Migrating user roles...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (userRolesError) {
      console.error('Error fetching user roles:', userRolesError);
    } else {
      for (const userRole of userRoles) {
        await prisma.userRoleModel.upsert({
          where: { id: userRole.id },
          update: userRole,
          create: userRole
        });
      }
      console.log(`Migrated ${userRoles.length} user roles`);
    }

    console.log('Data migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
