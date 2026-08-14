import { initTables } from './order/orderInit';
import { getOrderById, getUserOrders, getAllOrders } from './order/orderRead';
import { createOrder, updateOrderStatus, updateOrderPrepTime, partialRejectOrder, updateOrderFulfillment } from './order/orderWrite';

export const orderService = {
  initTables,
  createOrder,
  getOrderById,
  updateOrderStatus,
  updateOrderPrepTime,
  partialRejectOrder,
  updateOrderFulfillment,
  getUserOrders,
  getAllOrders,
};

