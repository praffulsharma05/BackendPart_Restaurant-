import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';
import { logger } from '../utils/logger';

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      logger.info('[Cart] Fetching cart', { userId });
      const items = await cartService.getCart(userId);
      res.json({ success: true, data: items });
    } catch (error) {
      logger.error('[Cart] Error in getCart:', error);
      next(error);
    }
  },

  async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { menuItemId, quantity, selectedOptions, customInstructions } = req.body;
      logger.info('[Cart] Adding item to cart', { userId, menuItemId, quantity });

      if (!menuItemId) {
        logger.warn('[Cart] Add to cart failed: Missing menuItemId');
        return res.status(400).json({ success: false, message: 'menuItemId is required' });
      }

      const items = await cartService.addToCart(
        userId,
        menuItemId,
        quantity || 1,
        selectedOptions,
        customInstructions
      );

      res.json({ success: true, data: items, message: 'Item added to cart' });
    } catch (error) {
      logger.error('[Cart] Error in addToCart:', error);
      next(error);
    }
  },

  async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { menuItemId, delta } = req.body;
      logger.info('[Cart] Updating item quantity', { userId, menuItemId, delta });

      if (!menuItemId || delta === undefined) {
        logger.warn('[Cart] Update quantity failed: Missing menuItemId or delta');
        return res.status(400).json({ success: false, message: 'menuItemId and delta are required' });
      }

      const items = await cartService.updateQuantity(userId, menuItemId, delta);
      res.json({ success: true, data: items });
    } catch (error) {
      logger.error('[Cart] Error in updateQuantity:', error);
      next(error);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const menuItemId = req.params.menuItemId || req.body.menuItemId;
      logger.info('[Cart] Removing item from cart', { userId, menuItemId });

      if (!menuItemId) {
        logger.warn('[Cart] Remove item failed: Missing menuItemId');
        return res.status(400).json({ success: false, message: 'menuItemId is required' });
      }

      const items = await cartService.removeItem(userId, menuItemId);
      res.json({ success: true, data: items, message: 'Item removed from cart' });
    } catch (error) {
      logger.error('[Cart] Error in removeItem:', error);
      next(error);
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      logger.info('[Cart] Clearing cart', { userId });
      const items = await cartService.clearCart(userId);
      res.json({ success: true, data: items, message: 'Cart cleared' });
    } catch (error) {
      logger.error('[Cart] Error in clearCart:', error);
      next(error);
    }
  },

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { promoCode } = req.body;
      logger.info('[Cart] Initializing checkout', { userId, promoCode });
      const cartItems = await cartService.getCart(userId);

      const subtotal = cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
      const discount = promoCode ? subtotal * 0.15 : 0;
      const tax = subtotal * 0.08;
      const total = Math.max(0, subtotal - discount + tax);

      return res.json({
        success: true,
        message: 'Checkout initialized successfully',
        data: {
          subtotal,
          discount,
          tax,
          total,
          itemCount: cartItems.length,
          appliedPromo: promoCode || null,
        },
      });
    } catch (error) {
      logger.error('[Cart] Error in checkout:', error);
      next(error);
    }
  },
};

