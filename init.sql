-- Set global configurations
SET GLOBAL host_cache_size=0;

-- Set authentication policy
SET GLOBAL authentication_policy='caching_sha2_password';

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS expert_guide_DB;
USE expert_guide_DB;

-- Set default authentication method for new accounts
ALTER USER 'root'@'%' IDENTIFIED WITH caching_sha2_password BY 'root';

-- Additional database configurations
SET GLOBAL max_connections = 1000;
SET GLOBAL connect_timeout = 30;

-- Enable binary logging for replication (optional)
-- SET GLOBAL binlog_format = ROW;

-- Set character set and collation
SET GLOBAL character_set_server = utf8mb4;
SET GLOBAL collation_server = utf8mb4_unicode_ci;