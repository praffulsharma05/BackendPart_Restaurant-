export type UserRole = 'CUSTOMER' | 'ADMIN' | 'KITCHEN' | 'WAITER';

export interface UserPayload {
  id: string;
  phone: string;
  role: UserRole;
  name: string;
}

export type OrderType = 'Dine In' | 'Car Order' | 'Take Away' | 'Pre Order' | 'Delivery';

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Served' | 'Completed' | 'Cancelled';

export type PrepTimeMinutes = 10 | 15 | 20 | 30 | 45;

export type InventoryStatus = 'AVAILABLE' | 'SOLD_OUT';

export interface CarFulfillmentInput {
  carNumber: string;
  carModel: string;
  parkingSpot?: string;
}

export interface DineInFulfillmentInput {
  tableNumber: string;
  seatNumber?: string;
}

export interface PreOrderFulfillmentInput {
  scheduledDate: string;
  scheduledTime: string;
}

export interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  selectedOptionIds?: string[];
  customInstructions?: string;
}

export interface CreateOrderInput {
  orderType: OrderType;
  items: OrderItemInput[];
  couponCode?: string;
  redeemPoints?: number;
  paymentMethod: 'QR Scan' | 'Card' | 'Cash' | 'UPI';
  carDetails?: CarFulfillmentInput;
  dineInDetails?: DineInFulfillmentInput;
  preOrderDetails?: PreOrderFulfillmentInput;
}
