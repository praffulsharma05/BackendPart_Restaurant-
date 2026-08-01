import { Request, Response, NextFunction } from 'express';
import { waiterService } from '../services/waiter.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const waiterController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async callWaiter(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableNumber } = req.body;
      if (!tableNumber) return sendError(res, 'Table number is required', 400);

      const userId = req.user?.id;
      const call = await waiterService.callWaiter(tableNumber, userId);


      return sendSuccess(res, `Waiter called to Table ${tableNumber}`, call, 201);
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
  async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      const calls = await waiterService.getPendingWaiterCalls();
      return sendSuccess(res, 'Pending waiter calls retrieved', calls);
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
  async attendCall(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await waiterService.attendWaiterCall(req.params.id);
      return sendSuccess(res, 'Waiter call attended', result);
    } catch (error) {
      next(error);
    }
  },
};
