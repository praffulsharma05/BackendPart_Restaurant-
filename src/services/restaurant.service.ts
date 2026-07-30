import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const restaurantService = {
  /**
   *
   */
  async getRestaurantDetails() {
    let info: any = null;
    try {
      // Priority 1: Check active non-deleted restaurant from restaurants table
      const [activeRows] = await dbPool.query<RowDataPacket[]>(
        'SELECT * FROM restaurants WHERE is_active = TRUE AND (is_deleted = FALSE OR is_deleted IS NULL) LIMIT 1'
      );
      if (activeRows.length > 0) {
        info = activeRows[0];
      } else {
        // Priority 2: Fall back to restaurant_info table
        const [infoRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_info LIMIT 1');
        if (infoRows.length > 0) {
          info = infoRows[0];
        }
      }
    } catch (e) {
      // Ignore error and use default fallback
    }

    if (!info) {
      info = {
        name: '',
        tagline: '',
        logo_url: '',
        phone: '',
        email: '',
        address: '',
        tax_percentage: 5.0,
        service_charge_percentage: 2.5,
        upi_id: '',
        qr_payment_image_url: '',
      };
    }

    let timingsRows: any[] = [];
    try {
      const [tRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_timings');
      timingsRows = tRows;
    } catch (e) {
      // Ignore error and use default empty array
    }

    return {
      info: {
        id: info.id || '1',
        name: info.name || '',
        tagline: info.tagline || '',
        logoUrl: info.logo_url || '',
        phone: info.phone || '',
        email: info.email || '',
        address: info.address || '',
        taxPercentage: Number(info.tax_percentage || 5.0),
        serviceChargePercentage: Number(info.service_charge_percentage || 2.5),
        qrDetails: {
          upiId: info.upi_id || '',
          qrCodeImageUrl: info.qr_payment_image_url || '',
        },
      },
      timings: timingsRows.map((t) => ({
        dayOfWeek: t.day_of_week,
        openTime: t.open_time,
        closeTime: t.close_time,
        isClosed: Boolean(t.is_closed),
      })),
    };
  },

  /**
   *
   * @param data
   */
  async updateRestaurantInfo(data: any) {
    const { name, tagline, logoUrl, phone, address, taxPercentage, serviceChargePercentage, upiId, qrPaymentImageUrl } = data;
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT id FROM restaurant_info LIMIT 1');
      if (rows.length === 0) {
        await dbPool.query(
          `INSERT INTO restaurant_info (id, name, tagline, logo_url, phone, address, tax_percentage, service_charge_percentage, upi_id, qr_payment_image_url)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name || '',
            tagline || '',
            logoUrl || '',
            phone || '',
            address || '',
            taxPercentage || 5.0,
            serviceChargePercentage || 2.5,
            upiId || '',
            qrPaymentImageUrl || ''
          ]
        );
      } else {
        await dbPool.query(
          `UPDATE restaurant_info SET 
            name = COALESCE(?, name),
            tagline = COALESCE(?, tagline),
            logo_url = COALESCE(?, logo_url),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            tax_percentage = COALESCE(?, tax_percentage),
            service_charge_percentage = COALESCE(?, service_charge_percentage),
            upi_id = COALESCE(?, upi_id),
            qr_payment_image_url = COALESCE(?, qr_payment_image_url)
           WHERE id = ?`,
          [name, tagline, logoUrl, phone, address, taxPercentage, serviceChargePercentage, upiId, qrPaymentImageUrl, rows[0].id]
        );
      }
    } catch (err) {
      console.error('Failed to update restaurant_info:', err);
    }
    return this.getRestaurantDetails();
  },

  /**
   *
   */
  async getAllRestaurants() {
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>(
        'SELECT * FROM restaurants WHERE is_deleted = FALSE OR is_deleted IS NULL ORDER BY created_at DESC'
      );
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        tagline: r.tagline,
        logoUrl: r.logo_url,
        phone: r.phone,
        email: r.email,
        address: r.address,
        taxPercentage: Number(r.tax_percentage || 5),
        serviceChargePercentage: Number(r.service_charge_percentage || 2.5),
        upiId: r.upi_id,
        qrPaymentImageUrl: r.qr_payment_image_url,
        isActive: Boolean(r.is_active),
        createdAt: r.created_at,
      }));
    } catch (err) {
      return [];
    }
  },

  // Requirement 1: POST API to add new restaurant data
  /**
   *
   * @param data
   */
  async createRestaurant(data: any) {
    const id = data.id || `rest-${Date.now()}`;
    const name = data.name || '';
    const tagline = data.tagline || '';
    const logoUrl = data.logoUrl || '';
    const phone = data.phone || '';
    const email = data.email || '';
    const address = data.address || '';
    const taxPercentage = data.taxPercentage !== undefined ? data.taxPercentage : 5.0;
    const serviceChargePercentage = data.serviceChargePercentage !== undefined ? data.serviceChargePercentage : 2.5;
    const upiId = data.upiId || '';

    try {
      // Deactivate all existing restaurants first
      await dbPool.query('UPDATE restaurants SET is_active = FALSE');

      await dbPool.query(
        `INSERT INTO restaurants (id, name, tagline, logo_url, phone, email, address, tax_percentage, service_charge_percentage, upi_id, is_active, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
        [id, name, tagline, logoUrl, phone, email, address, taxPercentage, serviceChargePercentage, upiId]
      );

      // Sync active tenant to restaurant_info so Frontend & Admin reflect it dynamically right away
      await this.updateRestaurantInfo({
        name,
        tagline,
        logoUrl,
        phone,
        address,
        taxPercentage,
        serviceChargePercentage,
        upiId,
      });
    } catch (err) {
      console.error('Failed to create restaurant in DB:', err);
    }

    return { id, name, tagline, logoUrl, phone, email, address, taxPercentage, serviceChargePercentage, upiId, isActive: true };
  },

  // Requirement 2: Partial Update API (Only send provided fields to update)
  /**
   *
   * @param id
   * @param data
   */
  async updateRestaurantBranding(id: string, data: any) {
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fieldsToUpdate.push('name = ?');
      values.push(data.name);
    }
    if (data.tagline !== undefined) {
      fieldsToUpdate.push('tagline = ?');
      values.push(data.tagline);
    }
    if (data.logoUrl !== undefined) {
      fieldsToUpdate.push('logo_url = ?');
      values.push(data.logoUrl);
    }
    if (data.phone !== undefined) {
      fieldsToUpdate.push('phone = ?');
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fieldsToUpdate.push('email = ?');
      values.push(data.email);
    }
    if (data.address !== undefined) {
      fieldsToUpdate.push('address = ?');
      values.push(data.address);
    }
    if (data.upiId !== undefined) {
      fieldsToUpdate.push('upi_id = ?');
      values.push(data.upiId);
    }
    if (data.taxPercentage !== undefined) {
      fieldsToUpdate.push('tax_percentage = ?');
      values.push(data.taxPercentage);
    }
    if (data.serviceChargePercentage !== undefined) {
      fieldsToUpdate.push('service_charge_percentage = ?');
      values.push(data.serviceChargePercentage);
    }

    if (fieldsToUpdate.length > 0) {
      values.push(id);
      const sql = `UPDATE restaurants SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND (is_deleted = FALSE OR is_deleted IS NULL)`;
      try {
        await dbPool.query(sql, values);
      } catch (err) {
        console.error('Error updating restaurant branding:', err);
      }
    }

    // Retrieve updated tenant record and synchronize to main restaurant_info table
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>(
        'SELECT * FROM restaurants WHERE id = ? AND (is_deleted = FALSE OR is_deleted IS NULL)',
        [id]
      );
      if (rows.length > 0) {
        const r = rows[0];

        // If updated tenant is active, update restaurant_info so Frontend & Admin see it live
        if (r.is_active) {
          await this.updateRestaurantInfo({
            name: r.name,
            tagline: r.tagline,
            logoUrl: r.logo_url,
            phone: r.phone,
            address: r.address,
            taxPercentage: r.tax_percentage,
            serviceChargePercentage: r.service_charge_percentage,
            upiId: r.upi_id,
          });
        }
      }
    } catch (err) {
      // Ignore error
    }

    return { id, ...data };
  },

  /**
   *
   * @param id
   */
  async setRestaurantActive(id: string) {
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>(
        'SELECT * FROM restaurants WHERE id = ? AND (is_deleted = FALSE OR is_deleted IS NULL)',
        [id]
      );
      if (rows.length > 0) {
        const r = rows[0];
        await dbPool.query('UPDATE restaurants SET is_active = FALSE');
        await dbPool.query('UPDATE restaurants SET is_active = TRUE WHERE id = ?', [id]);

        await this.updateRestaurantInfo({
          name: r.name,
          tagline: r.tagline,
          logoUrl: r.logo_url,
          phone: r.phone,
          address: r.address,
          taxPercentage: r.tax_percentage,
          serviceChargePercentage: r.service_charge_percentage,
          upiId: r.upi_id,
        });
      }
    } catch (err) {
      // Ignore error
    }

    return this.getRestaurantDetails();
  },

  // Requirement 3: Soft delete API for restaurant
  /**
   *
   * @param id
   */
  async deleteRestaurant(id: string) {
    try {
      // Soft Delete in database
      await dbPool.query('UPDATE restaurants SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);

      // If active restaurant was deleted, activate next available tenant
      const [activeRows] = await dbPool.query<RowDataPacket[]>(
        'SELECT id FROM restaurants WHERE is_active = TRUE AND (is_deleted = FALSE OR is_deleted IS NULL) LIMIT 1'
      );

      if (activeRows.length === 0) {
        const [nextAvailable] = await dbPool.query<RowDataPacket[]>(
          'SELECT id FROM restaurants WHERE (is_deleted = FALSE OR is_deleted IS NULL) ORDER BY created_at DESC LIMIT 1'
        );
        if (nextAvailable.length > 0) {
          await this.setRestaurantActive(nextAvailable[0].id);
        }
      }
    } catch (err) {
      console.error('Error soft deleting restaurant:', err);
    }
    return { success: true, id };
  }
};
