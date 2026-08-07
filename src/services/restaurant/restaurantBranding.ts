import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { updateRestaurantInfo } from './restaurantWrite';

export async function updateRestaurantBranding(id: string, data: any) {
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

  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM restaurants WHERE id = ? AND (is_deleted = FALSE OR is_deleted IS NULL)',
      [id]
    );
    if (rows.length > 0) {
      const r = rows[0];

      if (r.is_active) {
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
    }
  } catch (err) {
    // Ignore
  }

  return { id, ...data };
}
