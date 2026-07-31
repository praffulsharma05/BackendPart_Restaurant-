import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const items = await cartService.getCart(userId);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { menuItemId, quantity, selectedOptions, customInstructions } = req.body;

      if (!menuItemId) {
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
      next(error);
    }
  },

  async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { menuItemId, delta } = req.body;

      if (!menuItemId || delta === undefined) {
        return res.status(400).json({ success: false, message: 'menuItemId and delta are required' });
      }

      const items = await cartService.updateQuantity(userId, menuItemId, delta);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const menuItemId = req.params.menuItemId || req.body.menuItemId;

      if (!menuItemId) {
        return res.status(400).json({ success: false, message: 'menuItemId is required' });
      }

      const items = await cartService.removeItem(userId, menuItemId);
      res.json({ success: true, data: items, message: 'Item removed from cart' });
    } catch (error) {
      next(error);
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const items = await cartService.clearCart(userId);
      res.json({ success: true, data: items, message: 'Cart cleared' });
    } catch (error) {
      next(error);
    }
  },

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { promoCode } = req.body;
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
      next(error);
    }
  },
};
