export const SPICE_LEVELS = {
  SPICY: 'spicy',
  NONE: 'none',
  MILD: 'mild',
  MEDIUM: 'medium',
  EXTRA_SPICY: 'extra-spicy',
} as const;

export const SPICE_KEYWORDS = {
  SPICY: ['spicy', 'masala', 'chilli', 'pepper', 'tadka', 'kadai', 'kolhapuri', 'vindaloo', 'peri'],
  EXTRA_SPICY: ['extra spicy', 'kolhapuri', 'vindaloo', 'peri'],
  VERY_SPICY: ['extra spicy', 'very spicy'],
  MILD: ['mild', 'sweet', 'butter', 'cream', 'naan', 'roti', 'paratha'],
  MEDIUM: ['medium', 'dal', 'paneer', 'rice', 'jeera'],
} as const;

export const PRICE_RANGES = {
  UNDER100: 'under100',
  RANGE_100_300: '100_300',
  ABOVE300: 'above300',
} as const;

export const SORT_BY_KEYS = {
  RATING_HIGH: 'rating_high',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
} as const;

export const DEFAULTS = {
  PREP_TIME_MINUTES: 15,
  RATING: 4.8,
  SPICE_LEVEL: 'medium',
  INVENTORY_STATUS: 'AVAILABLE',
} as const;

export const SQL_QUERIES = {
  ALTER_IS_DELETED: 'ALTER TABLE menu_items ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE',
  ALTER_PREP_TIME: 'ALTER TABLE menu_items ADD COLUMN prep_time_minutes INT DEFAULT 15',
  ALTER_SPICE_LEVEL: "ALTER TABLE menu_items ADD COLUMN spice_level VARCHAR(20) DEFAULT 'medium'",
  ALTER_COUPON_CODE: 'ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(30)',
} as const;
