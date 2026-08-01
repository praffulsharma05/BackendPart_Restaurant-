import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { OrderStatus, PrepTimeMinutes } from '../types';

export const orderController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'u101';
      const order = await orderService.createOrder(userId, req.body);


      return sendSuccess(res, 'Order placed successfully', order, 201);
    } catch (error: any) {
      console.error('CRITICAL Order Creation Error:', error);
      return sendError(res, error.message || 'Failed to place order', 400);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) return sendError(res, 'Order not found', 404);
      return sendSuccess(res, 'Order details retrieved', order);
    } catch (error) {
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, cancellationReason, prepTimeMinutes } = req.body;
      const validStatuses: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'];

      if (!validStatuses.includes(status)) {
        return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const updatedOrder = await orderService.updateOrderStatus(req.params.id, status, cancellationReason, prepTimeMinutes);


      return sendSuccess(res, `Order status updated to '${status}'`, updatedOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updatePrepTime(req: Request, res: Response, next: NextFunction) {
    try {
      const { minutes } = req.body;
      const validTimes: PrepTimeMinutes[] = [10, 15, 20, 30, 45];

      if (!validTimes.includes(Number(minutes) as PrepTimeMinutes)) {
        return sendError(res, 'Preparation time must be 10, 15, 20, 30, or 45 minutes.', 400);
      }

      const updatedOrder = await orderService.updateOrderPrepTime(req.params.id, Number(minutes) as PrepTimeMinutes);


      return sendSuccess(res, `Preparation time updated to ${minutes} mins`, updatedOrder);
    } catch (error) {
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'u101';
      const orders = await orderService.getUserOrders(userId);
      return sendSuccess(res, 'User orders retrieved', orders);
    } catch (error) {
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const orders = await orderService.getAllOrders(status as string);
      return sendSuccess(res, 'All orders retrieved', orders);
    } catch (error) {
      next(error);
    }
  },
};
