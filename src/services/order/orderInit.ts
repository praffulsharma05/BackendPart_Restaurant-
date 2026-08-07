import { dbPool } from '../../config/db';
import { ORDER_STRINGS } from './orderStrings';

export async function initTables() {
  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_ORDERS_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.ALTER_ORDERS_TABLE);

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_PAYMENT_SCREENSHOT);
    } catch (_e) {
      // Fallback if column already exists
    }

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_COUPON_CODE_COLUMN);
    } catch (_e) {
      // Column already exists
    }

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_UPDATED_AT_COLUMN);
    } catch (_e) {
      // Column already exists
    }

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_ORDER_TOKEN_COLUMN);
    } catch (_e) {
      // Column already exists
    }
  } catch (_e) {
    // Table modification fallback
  }

  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_USERS_TABLE);
  } catch (_e) {
    // User table initialization fallback
  }

  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_ORDER_ITEMS_TABLE);
  } catch (_e) {
    // order_items table initialization fallback
  }

  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_ORDER_ITEM_OPTIONS_TABLE);
  } catch (_e) {
    // order_item_options table initialization fallback
  }

  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_CAR_FULFILLMENT_TABLE);
  } catch (_e) {
    // order_fulfillment_car table initialization fallback
  }

  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_DINE_IN_FULFILLMENT_TABLE);
  } catch (_e) {
    // order_fulfillment_dine_in table initialization fallback
  }

  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_PRE_ORDER_FULFILLMENT_TABLE);
  } catch (_e) {
    // order_fulfillment_pre_order table initialization fallback
  }
}
