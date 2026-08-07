import { Request, Response, NextFunction } from 'express';
import { waiterService } from '../services/waiter.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const waiterController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async callWaiter(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableNumber, tableOrCarInfo } = req.body;
      const targetTable = tableNumber || tableOrCarInfo;
      logger.info('[Waiter] Call waiter request', { targetTable, userId: req.user?.id });
      if (!targetTable) {
        logger.warn('[Waiter] Call waiter failed: Missing table number or location info');
        return sendError(res, 'Table number or location info is required', 400);
      }

      const userId = req.user?.id;
      const call = await waiterService.callWaiter(targetTable, userId);

      return sendSuccess(res, `Waiter called to ${targetTable}`, call, 201);
    } catch (error) {
      logger.error('[Waiter] Error in callWaiter:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Waiter] Fetching pending waiter calls');
      const calls = await waiterService.getPendingWaiterCalls();
      return sendSuccess(res, 'Pending waiter calls retrieved', calls);
    } catch (error) {
      logger.error('[Waiter] Error in getPending:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async attendCall(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Waiter] Attending waiter call', { id: req.params.id });
      const result = await waiterService.attendWaiterCall(req.params.id);
      return sendSuccess(res, 'Waiter call attended', result);
    } catch (error) {
      logger.error('[Waiter] Error in attendCall:', error);
      next(error);
    }
  },
};

