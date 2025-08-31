import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test queries
    console.log('\nTesting queries...');
    
    // Count customers
    const customerCount = await prisma.customer.count();
    console.log(`📊 Customers: ${customerCount}`);
    
    // Count orders
    const orderCount = await prisma.order.count();
    console.log(`📊 Orders: ${orderCount}`);
    
    // Count players
    const playerCount = await prisma.player.count();
    console.log(`📊 Players: ${playerCount}`);
    
    // Count logos
    const logoCount = await prisma.logo.count();
    console.log(`📊 Logos: ${logoCount}`);
    
    // Count print configs
    const printConfigCount = await prisma.printConfig.count();
    console.log(`📊 Print Configs: ${printConfigCount}`);
    
    // Count product lines
    const productLineCount = await prisma.productLine.count();
    console.log(`📊 Product Lines: ${productLineCount}`);
    
    // Count sizes
    const sizeCount = await prisma.size.count();
    console.log(`📊 Sizes: ${sizeCount}`);
    
    // Count fonts
    const fontCount = await prisma.font.count();
    console.log(`📊 Fonts: ${fontCount}`);
    
    // Count delivery information
    const deliveryInfoCount = await prisma.deliveryInformation.count();
    console.log(`📊 Delivery Information: ${deliveryInfoCount}`);
    
    // Count user roles
    const userRoleCount = await prisma.userRoleModel.count();
    console.log(`📊 User Roles: ${userRoleCount}`);
    
    console.log('\n✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
