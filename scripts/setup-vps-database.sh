#!/bin/bash

# Setup PostgreSQL Database on VPS
# Run this script on your VPS

echo "Setting up PostgreSQL database for Jersey Design Studio..."

# Update system
sudo apt update
sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE jersey_design_studio;
CREATE USER jersey_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE jersey_design_studio TO jersey_user;
ALTER USER jersey_user CREATEDB;
\q
EOF

# Configure PostgreSQL for remote connections (optional)
echo "Configuring PostgreSQL for remote connections..."

# Edit postgresql.conf
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Edit pg_hba.conf to allow connections
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

echo "PostgreSQL setup completed!"
echo "Database: jersey_design_studio"
echo "User: jersey_user"
echo "Password: your_secure_password_here"
echo ""
echo "Update your .env file with:"
echo "DATABASE_URL=\"postgresql://jersey_user:your_secure_password_here@YOUR_VPS_IP:5432/jersey_design_studio\""
