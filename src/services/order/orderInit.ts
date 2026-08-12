import { dbPool } from '../../config/db';
import { ORDER_STRINGS } from './orderStrings';

let tablesInitialized = false;

export async function initTables() {
  if (tablesInitialized) return;
  try {
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_ORDERS_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.ALTER_ORDERS_TABLE);

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_PAYMENT_SCREENSHOT);
    } catch (_e) {}

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_COUPON_CODE_COLUMN);
    } catch (_e) {}

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_UPDATED_AT_COLUMN);
    } catch (_e) {}

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_ORDER_TOKEN_COLUMN);
    } catch (_e) {}

    try {
      await dbPool.query(ORDER_STRINGS.SQL.ADD_SPECIAL_INSTRUCTIONS_COLUMN);
    } catch (_e) {}

    await dbPool.query(ORDER_STRINGS.SQL.CREATE_USERS_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_ORDER_ITEMS_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_ORDER_ITEM_OPTIONS_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_CAR_FULFILLMENT_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_DINE_IN_FULFILLMENT_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_PRE_ORDER_FULFILLMENT_TABLE);
    await dbPool.query(ORDER_STRINGS.SQL.CREATE_SAVED_VEHICLES_TABLE);

    tablesInitialized = true;
  } catch (_e) {
    tablesInitialized = true;
  }
}
