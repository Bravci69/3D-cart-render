-- CardCatcher 3D Render - Basic SQL Schema (MySQL 8+ / MariaDB for WordPress hosting)

CREATE TABLE IF NOT EXISTS cardcatcher_3d_products (
  id VARCHAR(128) PRIMARY KEY,
  wp_product_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  game VARCHAR(32) NOT NULL DEFAULT 'pokemon',
  product_type VARCHAR(48) NOT NULL DEFAULT 'booster-pack',
  language VARCHAR(16) NOT NULL DEFAULT 'en',
  set_name VARCHAR(128) NULL,
  series_name VARCHAR(128) NULL,
  set_code VARCHAR(32) NULL,
  sku VARCHAR(128) NULL,
  price DECIMAL(10, 2) NULL,
  currency VARCHAR(12) NOT NULL DEFAULT '€',
  textures_json JSON NOT NULL,
  images_json JSON NOT NULL,
  dimensions_json JSON NOT NULL,
  material_json JSON NOT NULL,
  image_source VARCHAR(160) NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_game_type (game, product_type),
  INDEX idx_wp_id (wp_product_id),
  INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample basic SQL read query used by WordPress sync for WooCommerce products:
-- SELECT
--   p.ID AS externalId,
--   p.post_title AS name,
--   p.post_name AS slug,
--   p.post_excerpt AS description,
--   MAX(CASE WHEN pm.meta_key = '_price' THEN pm.meta_value END) AS price,
--   MAX(CASE WHEN pm.meta_key = '_sku' THEN pm.meta_value END) AS sku,
--   MAX(CASE WHEN pm.meta_key = '_thumbnail_id' THEN img.guid END) AS existingImageUrl
-- FROM wp_posts p
-- LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id
-- LEFT JOIN wp_posts img ON pm.meta_key = '_thumbnail_id' AND img.ID = CAST(pm.meta_value AS UNSIGNED)
-- WHERE p.post_type = 'product' AND p.post_status = 'publish'
-- GROUP BY p.ID, p.post_title, p.post_name, p.post_excerpt
-- ORDER BY p.ID DESC;
