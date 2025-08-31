# Jersey Design Studio - Supabase to PostgreSQL Migration

## 📋 Tổng quan
Project này chứa các scripts và hướng dẫn để migrate từ Supabase sang PostgreSQL + Prisma để lưu trữ trên VPS.

## 🚀 Tính năng
- ✅ Export database từ Supabase
- ✅ Export storage files và metadata
- ✅ Tạo Prisma schema
- ✅ Migration scripts
- ✅ Setup scripts cho VPS

## 📁 Cấu trúc Project

```
├── prisma/
│   └── schema.prisma          # Prisma schema cho PostgreSQL
├── scripts/
│   ├── migrate-data.js        # Script migrate data
│   ├── setup-vps-database.sh  # Setup PostgreSQL trên VPS
│   ├── test-database-connection.js # Test kết nối
│   ├── export-storage-info.js # Export storage metadata
│   └── download-storage-files.js # Download files từ Supabase
├── src/
│   └── lib/
│       └── prisma.ts          # Prisma client wrapper
├── MIGRATION_GUIDE.md         # Hướng dẫn chi tiết
├── env.example                # Template environment variables
└── README_MIGRATION.md        # File này
```

## 🗄️ Database Schema

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

## 🔧 Cài đặt

### 1. Cài đặt dependencies
```bash
npm install
npm install prisma @prisma/client
```

### 2. Setup environment
```bash
cp env.example .env
# Chỉnh sửa DATABASE_URL trong .env
```

### 3. Generate Prisma client
```bash
npx prisma generate
```

## 📊 Migration Status

### ✅ Đã hoàn thành:
- Database schema export
- Database data export
- Storage metadata export
- Prisma schema creation
- Migration scripts

### 📈 Dữ liệu đã export:
- **Database**: 1.4MB (full backup)
- **Logos**: 137 records
- **Fonts**: 7 records
- **Orders**: 68 records
- **Players**: 737 records

## 🚀 Sử dụng

### 1. Setup VPS Database
```bash
# Upload script lên VPS
scp scripts/setup-vps-database.sh user@your-vps-ip:/tmp/

# SSH vào VPS và chạy
ssh user@your-vps-ip
cd /tmp
chmod +x setup-vps-database.sh
./setup-vps-database.sh
```

### 2. Import Database
```bash
# Upload backup file
scp full_backup.sql user@your-vps-ip:/tmp/

# Import vào PostgreSQL
psql -h localhost -U jersey_user -d jersey_design_studio -f /tmp/full_backup.sql
```

### 3. Test Connection
```bash
node scripts/test-database-connection.js
```

### 4. Migrate Data (nếu cần)
```bash
node scripts/migrate-data.js
```

## 🔒 Bảo mật

### Files được loại trừ khỏi Git:
- Database backups (*.sql)
- Environment files (.env)
- Storage files
- Sensitive metadata

### Lưu ý:
- Không commit database backups
- Không commit environment variables
- Không commit storage files lớn

## 📚 Tài liệu tham khảo

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Hướng dẫn chi tiết
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

---

**Lưu ý**: Đây là project migration, không phải production code. Sử dụng cẩn thận và backup dữ liệu trước khi thực hiện migration.
