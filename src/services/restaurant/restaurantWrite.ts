import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { getRestaurantDetails } from './restaurantRead';
import { updateRestaurantBranding } from './restaurantBranding';

export { updateRestaurantBranding };

export async function updateRestaurantInfo(data: any) {
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
          qrPaymentImageUrl || '',
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
  return getRestaurantDetails();
}

export async function createRestaurant(data: any) {
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
    await dbPool.query('UPDATE restaurants SET is_active = FALSE');

    await dbPool.query(
      `INSERT INTO restaurants (id, name, tagline, logo_url, phone, email, address, tax_percentage, service_charge_percentage, upi_id, is_active, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
      [id, name, tagline, logoUrl, phone, email, address, taxPercentage, serviceChargePercentage, upiId]
    );

    await updateRestaurantInfo({
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
}

export async function setRestaurantActive(id: string) {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM restaurants WHERE id = ? AND (is_deleted = FALSE OR is_deleted IS NULL)',
      [id]
    );
    if (rows.length > 0) {
      const r = rows[0];
      await dbPool.query('UPDATE restaurants SET is_active = FALSE');
      await dbPool.query('UPDATE restaurants SET is_active = TRUE WHERE id = ?', [id]);

      await updateRestaurantInfo({
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
    // Ignore
  }

  return getRestaurantDetails();
}

export async function deleteRestaurant(id: string) {
  try {
    await dbPool.query('UPDATE restaurants SET is_deleted = TRUE, is_active = FALSE WHERE id = ?', [id]);

    const [activeRows] = await dbPool.query<RowDataPacket[]>(
      'SELECT id FROM restaurants WHERE is_active = TRUE AND (is_deleted = FALSE OR is_deleted IS NULL) LIMIT 1'
    );

    if (activeRows.length === 0) {
      const [nextAvailable] = await dbPool.query<RowDataPacket[]>(
        'SELECT id FROM restaurants WHERE (is_deleted = FALSE OR is_deleted IS NULL) ORDER BY created_at DESC LIMIT 1'
      );
      if (nextAvailable.length > 0) {
        await setRestaurantActive(nextAvailable[0].id);
      }
    }
  } catch (err) {
    console.error('Error soft deleting restaurant:', err);
  }
  return { success: true, id };
}
