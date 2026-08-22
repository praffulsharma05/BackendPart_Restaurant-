import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { CreateOrderInput } from '../../types';
import { ORDER_STRINGS } from './orderStrings';

export interface ProcessedOrderItems {
  processedItems: any[];
  subtotal: number;
  maxPrepTime: number;
}

export async function processOrderItems(
  connection: PoolConnection,
  input: CreateOrderInput
): Promise<ProcessedOrderItems> {
  if (!input || !Array.isArray(input.items) || input.items.length === 0) {
    throw new Error(ORDER_STRINGS.ERRORS.NO_ITEMS);
  }

  let subtotal = 0;
  const processedItems: any[] = [];
  let maxPrepTime = 15;

  for (const rawItemInput of input.items) {
    const itemInput = rawItemInput as any;
    let menuItem: any = null;
    try {
      const [menuRows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM menu_items WHERE id = ?',
        [itemInput.menuItemId]
      );
      if (menuRows.length > 0) {
        menuItem = menuRows[0];
      }
    } catch (_e) {}

    if (!menuItem) {
      menuItem = {
        id: itemInput.menuItemId,
        name: itemInput.name || 'Dish Item',
        price: itemInput.unitPrice || 0,
        inventory_status: 'AVAILABLE',
        prep_time_minutes: 15,
      };
    }

    const itemPrepMinutes = menuItem.prep_time_minutes ? Number(menuItem.prep_time_minutes) : 15;
    if (itemPrepMinutes > maxPrepTime) {
      maxPrepTime = itemPrepMinutes;
    }

    if (menuItem.inventory_status === 'SOLD_OUT') {
      throw new Error(ORDER_STRINGS.ERRORS.SOLD_OUT(menuItem.name));
    }

    const inputUnitPrice = Number(itemInput.unitPrice !== undefined ? itemInput.unitPrice : itemInput.price);
    let itemUnitPrice = !isNaN(inputUnitPrice) && inputUnitPrice > 0 ? inputUnitPrice : Number(menuItem.price);

    if (isNaN(itemUnitPrice) || itemUnitPrice <= 0) {
      try {
        const [variantRows] = await connection.query<RowDataPacket[]>(
          'SELECT variant_price FROM menu_item_variants WHERE menu_item_id = ? AND is_deleted = FALSE ORDER BY variant_price ASC LIMIT 1',
          [menuItem.id]
        );
        if (variantRows.length > 0) {
          itemUnitPrice = Number(variantRows[0].variant_price);
        }
      } catch (_varErr) {}
    }

    if (isNaN(itemUnitPrice)) {
      itemUnitPrice = 0;
    }
    let optionsTotal = 0;
    const selectedOptionsList: any[] = [];

    if (itemInput.selectedOptionIds && itemInput.selectedOptionIds.length > 0) {
      for (const optId of itemInput.selectedOptionIds) {
        const [optRows] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM customization_options WHERE id = ?',
          [optId]
        );
        if (optRows.length > 0) {
          const opt = optRows[0];
          optionsTotal += Number(opt.price);
          selectedOptionsList.push({ id: opt.id, name: opt.name, price: Number(opt.price) });
        }
      }
    }

    const itemSubtotal = (itemUnitPrice + optionsTotal) * itemInput.quantity;
    subtotal += itemSubtotal;

    processedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      unitPrice: itemUnitPrice,
      quantity: itemInput.quantity,
      subtotal: itemSubtotal,
      customInstructions:
        itemInput.customInstructions ||
        itemInput.specialInstructions ||
        itemInput.specialRequest ||
        itemInput.instructions ||
        itemInput.notes ||
        '',
      options: selectedOptionsList,
    });
  }

  return { processedItems, subtotal, maxPrepTime };
}
