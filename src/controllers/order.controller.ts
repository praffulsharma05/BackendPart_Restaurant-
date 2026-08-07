import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { OrderStatus, PrepTimeMinutes } from '../types';
import { STAFF_ROLES, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';

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
      logger.info('[Order] Creating order', { userId });
      const order = await orderService.createOrder(userId, req.body);
      logger.info('[Order] Order created successfully', { orderId: order.id, userId });

      return sendSuccess(res, 'Order placed successfully', order, 201);
    } catch (error: any) {
      logger.error('[Order] Error in createOrder:', error);
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
      logger.info('[Order] Fetching order by ID', { id: req.params.id });
      const order = await orderService.getOrderById(req.params.id);
      if (!order) return sendError(res, 'Order not found', 404);

      // Authorization Check:
      // 1. Order token sent in X-Order-Token header matches order.orderToken (Device that placed order)
      // 2. User is logged in and is the owner (req.user.id === order.userId)
      // 3. User is authorized restaurant staff (ADMIN, KITCHEN, WAITER)
      const requestToken = (req.headers['x-order-token'] || req.query.token) as string | undefined;
      const hasValidToken = Boolean(
        requestToken && order.orderToken && requestToken.trim() === order.orderToken.trim()
      );
      const isOwner = Boolean(req.user && req.user.id === order.userId);
      const isStaff = Boolean(req.user && STAFF_ROLES.includes(req.user.role));

      if (!isOwner && !isStaff && !hasValidToken) {
        logger.warn('[Order] Access denied to order details', { id: req.params.id, userId: req.user?.id });
        return sendError(
          res,
          'Access Denied: You are not authorized to view this order details on this device.',
          403
        );
      }

      return sendSuccess(res, 'Order details retrieved', order);
    } catch (error) {
      logger.error('[Order] Error in getOrderById:', error);
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
      logger.info('[Order] Updating order status', { id: req.params.id, status, cancellationReason, prepTimeMinutes });
      const validStatuses: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled'];

      if (!validStatuses.includes(status)) {
        logger.warn('[Order] Invalid order status requested', { status });
        return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const updatedOrder = await orderService.updateOrderStatus(req.params.id, status, cancellationReason, prepTimeMinutes);

      return sendSuccess(res, `Order status updated to '${status}'`, updatedOrder);
    } catch (error) {
      logger.error('[Order] Error in updateStatus:', error);
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
      const numMinutes = Number(minutes);
      logger.info('[Order] Updating order prep time', { id: req.params.id, minutes: numMinutes });

      if (isNaN(numMinutes) || numMinutes <= 0 || numMinutes > 180) {
        logger.warn('[Order] Invalid prep time requested', { minutes });
        return sendError(res, 'Preparation time must be a valid number between 1 and 180 minutes.', 400);
      }

      const updatedOrder = await orderService.updateOrderPrepTime(req.params.id, numMinutes);

      return sendSuccess(res, `Preparation time updated to ${minutes} mins`, updatedOrder);
    } catch (error) {
      logger.error('[Order] Error in updatePrepTime:', error);
      next(error);
    }
  },

  async partialReject(req: Request, res: Response, next: NextFunction) {
    try {
      const { rejectedItemIds } = req.body;
      logger.info('[Order] Partially rejecting order items', { id: req.params.id, rejectedItemIds });
      if (!Array.isArray(rejectedItemIds) || rejectedItemIds.length === 0) {
        logger.warn('[Order] Partial reject failed: Missing rejectedItemIds');
        return sendError(res, 'rejectedItemIds array is required', 400);
      }

      const updatedOrder = await orderService.partialRejectOrder(req.params.id, rejectedItemIds);
      return sendSuccess(res, 'Order partially rejected/accepted successfully', updatedOrder);
    } catch (error: any) {
      logger.error('[Order] Error in partialReject:', error);
      return sendError(res, error.message || 'Failed to partially reject order', 400);
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
      logger.info('[Order] Fetching user orders', { userId });
      const orders = await orderService.getUserOrders(userId);
      return sendSuccess(res, 'User orders retrieved', orders);
    } catch (error) {
      logger.error('[Order] Error in getUserOrders:', error);
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
      logger.info('[Order] Fetching all orders', { status });
      const orders = await orderService.getAllOrders(status as string);
      return sendSuccess(res, 'All orders retrieved', orders);
    } catch (error) {
      logger.error('[Order] Error in getAllOrders:', error);
      next(error);
    }
  },
};

