import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const restaurantService = {
  async getRestaurantDetails() {
    let info: any = null;
    try {
      const [infoRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_info LIMIT 1');
      info = infoRows[0];
    } catch (e) {}

    if (!info) {
      info = {
        name: 'Prafful Sharma Restaurant',
        tagline: 'Authentic Fine Dining & Gourmet Experience',
        logo_url: 'https://res.cloudinary.com/dekctt0su/image/upload/v1785323139/restaurant_logos/gmeqdkzewyyy9pur52lh.jpg',
        phone: '+1 800-589-3463',
        address: '100 Gourmet Boulevard, Suite 400',
        tax_percentage: 5.0,
        service_charge_percentage: 2.5,
        upi_id: 'luxedine@bank',
        qr_payment_image_url: 'https://images.unsplash.com/photo-1556742049-0a67dd35f3d7?w=500',
      };
    }

    let timingsRows: any[] = [];
    try {
      const [tRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_timings');
      timingsRows = tRows;
    } catch (e) {}

    return {
      info: {
        name: info.name || 'Prafful Sharma Restaurant',
        tagline: info.tagline || 'Authentic Fine Dining & Gourmet Experience',
        logoUrl: info.logo_url || 'https://res.cloudinary.com/dekctt0su/image/upload/v1785323139/restaurant_logos/gmeqdkzewyyy9pur52lh.jpg',
        phone: info.phone || '+1 800-589-3463',
        address: info.address || '100 Gourmet Boulevard, Suite 400',
        taxPercentage: Number(info.tax_percentage || 5.0),
        serviceChargePercentage: Number(info.service_charge_percentage || 2.5),
        qrDetails: {
          upiId: info.upi_id || 'luxedine@bank',
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

  async updateRestaurantInfo(data: any) {
    const { name, tagline, logoUrl, phone, address, taxPercentage, serviceChargePercentage, upiId, qrPaymentImageUrl } = data;
    try {
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
         WHERE id = 1`,
        [name, tagline, logoUrl, phone, address, taxPercentage, serviceChargePercentage, upiId, qrPaymentImageUrl]
      );
    } catch (err) {
      console.error('Failed to update restaurant_info:', err);
    }
    return this.getRestaurantDetails();
  },

  async getAllRestaurants() {
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurants ORDER BY created_at DESC');
      if (rows.length === 0) {
        return [
          {
            id: 'rest-101',
            name: 'Prafful Sharma Restaurant',
            tagline: 'Authentic Fine Dining & Gourmet Experience',
            logoUrl: 'https://res.cloudinary.com/dekctt0su/image/upload/v1785323139/restaurant_logos/gmeqdkzewyyy9pur52lh.jpg',
            phone: '7878606937',
            email: 'contact@luxedine.com',
            address: '100 Gourmet Boulevard, Downtown, Suite 400',
            taxPercentage: 5.0,
            serviceChargePercentage: 2.5,
            upiId: 'luxedine@bank',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'rest-102',
            name: 'Spice Symphony Bistro',
            tagline: 'Exquisite Pan-Asian & Fusion Delights',
            logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
            phone: '9876543210',
            email: 'info@spicesymphony.com',
            address: '45 Culinary Street, City Center',
            taxPercentage: 5.0,
            serviceChargePercentage: 2.0,
            upiId: 'spicesymphony@upi',
            isActive: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'rest-103',
            name: 'La Bella Italia Pizzeria',
            tagline: 'Authentic Wood-Fired Neapolitan Pizza',
            logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
            phone: '8899001122',
            email: 'ciao@labellaitalia.com',
            address: '12 Via Roma Way, Little Italy',
            taxPercentage: 5.0,
            serviceChargePercentage: 2.5,
            upiId: 'labella@okaxis',
            isActive: false,
            createdAt: new Date().toISOString(),
          }
        ];
      }
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

  async createRestaurant(data: any) {
    const id = data.id || `rest-${Date.now()}`;
    const name = data.name || 'New Restaurant';
    const tagline = data.tagline || 'Gourmet Dining Experience';
    const logoUrl = data.logoUrl || 'https://res.cloudinary.com/dekctt0su/image/upload/v1785323139/restaurant_logos/gmeqdkzewyyy9pur52lh.jpg';
    const phone = data.phone || '';
    const email = data.email || '';
    const address = data.address || '';
    const taxPercentage = data.taxPercentage || 5.0;
    const serviceChargePercentage = data.serviceChargePercentage || 2.5;
    const upiId = data.upiId || '';

    try {
      await dbPool.query(
        `INSERT INTO restaurants (id, name, tagline, logo_url, phone, email, address, tax_percentage, service_charge_percentage, upi_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [id, name, tagline, logoUrl, phone, email, address, taxPercentage, serviceChargePercentage, upiId]
      );
    } catch (err) {
      console.error('Failed to create restaurant in DB:', err);
    }

    return { id, name, tagline, logoUrl, phone, email, address, taxPercentage, serviceChargePercentage, upiId, isActive: true };
  },

  async updateRestaurantBranding(id: string, data: any) {
    const { name, tagline, logoUrl, phone, email, address, taxPercentage, serviceChargePercentage, upiId } = data;

    try {
      await dbPool.query(
        `UPDATE restaurants SET
          name = COALESCE(?, name),
          tagline = COALESCE(?, tagline),
          logo_url = COALESCE(?, logo_url),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          address = COALESCE(?, address),
          tax_percentage = COALESCE(?, tax_percentage),
          service_charge_percentage = COALESCE(?, service_charge_percentage),
          upi_id = COALESCE(?, upi_id)
         WHERE id = ?`,
        [name, tagline, logoUrl, phone, email, address, taxPercentage, serviceChargePercentage, upiId, id]
      );
    } catch (err) {}

    // Synchronize into main active restaurant_info as well
    await this.updateRestaurantInfo({ name, tagline, logoUrl, phone, address, taxPercentage, serviceChargePercentage, upiId });

    return { id, ...data };
  },

  async setRestaurantActive(id: string) {
    try {
      const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurants WHERE id = ?', [id]);
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
    } catch (err) {}

    return this.getRestaurantDetails();
  },

  async deleteRestaurant(id: string) {
    try {
      await dbPool.query('DELETE FROM restaurants WHERE id = ?', [id]);
    } catch (err) {}
    return { success: true, id };
  }
};
