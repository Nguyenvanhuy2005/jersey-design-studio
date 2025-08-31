# Migration Guide: Supabase → PostgreSQL + Prisma

## Tổng quan
Hướng dẫn chuyển đổi từ Supabase sang PostgreSQL + Prisma để lưu trữ trên VPS.

## Bước 1: Export Database từ Supabase ✅

Database đã được export thành công với các file:
- `schema_backup.sql` - Cấu trúc database
- `data_backup.sql` - Dữ liệu
- `full_backup.sql` - Toàn bộ database

## Bước 2: Setup PostgreSQL trên VPS

### 2.1. Chạy script setup trên VPS:
```bash
# Upload script lên VPS
scp scripts/setup-vps-database.sh user@your-vps-ip:/tmp/

# SSH vào VPS và chạy script
ssh user@your-vps-ip
cd /tmp
chmod +x setup-vps-database.sh
./setup-vps-database.sh
```

### 2.2. Hoặc setup thủ công:
```bash
# Cài đặt PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Tạo database và user
sudo -u postgres psql
CREATE DATABASE jersey_design_studio;
CREATE USER jersey_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jersey_design_studio TO jersey_user;
\q
```

## Bước 3: Import Database vào VPS

### 3.1. Upload backup files lên VPS:
```bash
scp full_backup.sql user@your-vps-ip:/tmp/
```

### 3.2. Import database:
```bash
# SSH vào VPS
ssh user@your-vps-ip

# Import database
psql -h localhost -U jersey_user -d jersey_design_studio -f /tmp/full_backup.sql
```

## Bước 4: Setup Prisma

### 4.1. Cài đặt dependencies:
```bash
npm install prisma @prisma/client
```

### 4.2. Tạo Prisma schema (đã tạo):
File: `prisma/schema.prisma`

### 4.3. Generate Prisma client:
```bash
npx prisma generate
```

### 4.4. Setup environment variables:
Tạo file `.env`:
```env
DATABASE_URL="postgresql://jersey_user:your_password@your-vps-ip:5432/jersey_design_studio"
```

## Bước 5: Migrate Data (nếu cần)

### 5.1. Chạy migration script:
```bash
node scripts/migrate-data.js
```

## Bước 6: Thay thế Supabase Client

### 6.1. Thay thế trong code:
```typescript
// Thay vì:
import { supabase } from '@/integrations/supabase/client'

// Sử dụng:
import { prisma } from '@/lib/prisma'
```

### 6.2. Ví dụ migration:
```typescript
// Supabase
const { data, error } = await supabase
  .from('customers')
  .select('*')

// Prisma
const customers = await prisma.customer.findMany()
```

## Bước 7: Setup Authentication

### 7.1. Cài đặt NextAuth.js:
```bash
npm install next-auth @auth/prisma-adapter
```

### 7.2. Tạo auth configuration:
```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  // ... other config
})
```

## Bước 8: Deploy lên VPS

### 8.1. Build application:
```bash
npm run build
```

### 8.2. Deploy với PM2:
```bash
npm install -g pm2
pm2 start npm --name "jersey-design-studio" -- start
pm2 save
pm2 startup
```

## Cấu trúc Database

### Tables chính:
- `customers` - Thông tin khách hàng
- `orders` - Đơn hàng
- `players` - Cầu thủ
- `logos` - Logo
- `print_configs` - Cấu hình in
- `product_lines` - Dòng sản phẩm
- `sizes` - Kích thước
- `fonts` - Font chữ
- `delivery_information` - Thông tin giao hàng
- `user_roles` - Vai trò người dùng

### Relations:
- Customer → Orders (1:N)
- Order → Players (1:N)
- Order → Logos (1:N)
- Order → PrintConfigs (1:N)
- Order → ProductLines (1:N)

## Troubleshooting

### Lỗi thường gặp:

1. **Connection refused**: Kiểm tra firewall và PostgreSQL config
2. **Authentication failed**: Kiểm tra username/password
3. **Permission denied**: Kiểm tra user privileges

### Commands hữu ích:
```bash
# Kiểm tra PostgreSQL status
sudo systemctl status postgresql

# Kiểm tra connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Backup Strategy

### Tự động backup hàng ngày:
```bash
# Tạo cron job
crontab -e

# Thêm dòng này:
0 2 * * * pg_dump -h localhost -U jersey_user jersey_design_studio > /backup/db_$(date +\%Y\%m\%d).sql
```

## Performance Optimization

### 1. Indexes:
```sql
-- Tạo indexes cho các trường thường query
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_players_order_id ON players(order_id);
```

### 2. Connection pooling:
```bash
# Cài đặt PgBouncer
sudo apt install pgbouncer
```

## Security

### 1. Firewall:
```bash
# Chỉ mở port cần thiết
sudo ufw allow 5432/tcp
```

### 2. SSL:
```sql
-- Enable SSL trong PostgreSQL
ALTER SYSTEM SET ssl = on;
```

## Monitoring

### 1. Logs:
```bash
# Xem PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### 2. Performance:
```sql
-- Kiểm tra slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```
