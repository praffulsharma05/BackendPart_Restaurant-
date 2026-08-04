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
      const { tableNumber, tableOrCarInfo } = req.body;
      const targetTable = tableNumber || tableOrCarInfo;
      if (!targetTable) {
        return sendError(res, 'Table number or location info is required', 400);
      }

      const userId = req.user?.id;
      const call = await waiterService.callWaiter(targetTable, userId);


      return sendSuccess(res, `Waiter called to ${targetTable}`, call, 201);
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
