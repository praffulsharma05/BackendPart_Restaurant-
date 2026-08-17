import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/restaurant.service';
import { saveLocalFile } from '../utils/localStorage';
import { sendSuccess } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const restaurantController = {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Restaurant] Fetching restaurant details');
      const data = await restaurantService.getRestaurantDetails();
      return sendSuccess(res, 'Restaurant info and timings retrieved', data);
    } catch (error) {
      logger.error('[Restaurant] Error in getDetails:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async updateInfo(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Restaurant] Updating restaurant info');
      const data = await restaurantService.updateRestaurantInfo(req.body);
      return sendSuccess(res, 'Restaurant info updated successfully', data);
    } catch (error) {
      logger.error('[Restaurant] Error in updateInfo:', error);
      next(error);
    }
  },

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Restaurant] Uploading restaurant logo');
      if (!req.file) {
        logger.warn('[Restaurant] Logo upload failed: No logo file uploaded');
        return res.status(400).json({ success: false, message: 'No logo file uploaded' });
      }

      const imageUrl = saveLocalFile(req.file.buffer, req.file.originalname, 'restaurant_logos');

      // Automatically update MySQL database with uploaded logoUrl
      await restaurantService.updateRestaurantInfo({ logoUrl: imageUrl });

      return sendSuccess(res, 'Logo uploaded and saved to database successfully', { imageUrl });
    } catch (error) {
      logger.error('[Restaurant] Error in uploadLogo:', error);
      next(error);
    }
  },

  async getTables(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('[Restaurant] Fetching tables from database');
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_tables');
      
      const sortedRows = rows.map((r: any) => ({
        id: r.id,
        tableNumber: r.table_number,
        status: r.status,
      })).sort((a, b) => {
        const numA = parseInt(a.tableNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.tableNumber.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

      return res.json({ success: true, data: sortedRows });
    } catch (error) {
      logger.error('[Restaurant] Error in getTables:', error);
      next(error);
    }
  },

  async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableNumber, status } = req.body;
      logger.info('[Restaurant] Creating table', { tableNumber, status });
      if (!tableNumber) {
        return res.status(400).json({ success: false, message: 'tableNumber is required' });
      }

      // Check if tableNumber already exists
      const [existing] = await dbPool.query<RowDataPacket[]>(
        'SELECT id FROM restaurant_tables WHERE table_number = ?',
        [tableNumber]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Table number already exists' });
      }

      const id = `t_${Date.now()}`;
      await dbPool.query(
        'INSERT INTO restaurant_tables (id, table_number, status) VALUES (?, ?, ?)',
        [id, tableNumber, status || 'Available']
      );

      return res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: { id, tableNumber, status: status || 'Available' },
      });
    } catch (error) {
      logger.error('[Restaurant] Error in createTable:', error);
      next(error);
    }
  },
};

