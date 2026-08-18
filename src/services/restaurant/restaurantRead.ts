import { dbPool } from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { normalizeImageUrl } from '../../utils/imageUrl';

export async function getRestaurantDetails() {
  let info: any = null;
  try {
    const [activeRows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM restaurants WHERE is_active = TRUE AND (is_deleted = FALSE OR is_deleted IS NULL) LIMIT 1'
    );
    if (activeRows.length > 0) {
      info = activeRows[0];
    } else {
      const [infoRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_info LIMIT 1');
      if (infoRows.length > 0) {
        info = infoRows[0];
      }
    }
  } catch (e) {
    // Ignore error
  }

  if (!info) {
    info = {
      name: '',
      tagline: '',
      logo_url: '',
      phone: '',
      email: '',
      address: '',
      tax_percentage: 0,
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
    // Ignore error
  }

  return {
    info: {
      id: info.id || '1',
      name: info.name || '',
      tagline: info.tagline || '',
      logoUrl: normalizeImageUrl(info.logo_url || ''),
      phone: info.phone || '',
      email: info.email || '',
      address: info.address || '',
      taxPercentage: 0,
      serviceChargePercentage: Number(info.service_charge_percentage || 2.5),
      qrDetails: {
        upiId: info.upi_id || '',
        qrCodeImageUrl: normalizeImageUrl(info.qr_payment_image_url || ''),
      },
    },
    timings: timingsRows.map((t) => ({
      dayOfWeek: t.day_of_week,
      openTime: t.open_time,
      closeTime: t.close_time,
      isClosed: Boolean(t.is_closed),
    })),
  };
}

export async function getAllRestaurants() {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM restaurants WHERE is_deleted = FALSE OR is_deleted IS NULL ORDER BY created_at DESC'
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      tagline: r.tagline,
      logoUrl: normalizeImageUrl(r.logo_url),
      phone: r.phone,
      email: r.email,
      address: r.address,
      taxPercentage: 0,
      serviceChargePercentage: Number(r.service_charge_percentage || 2.5),
      upiId: r.upi_id,
      qrPaymentImageUrl: normalizeImageUrl(r.qr_payment_image_url),
      isActive: Boolean(r.is_active),
      createdAt: r.created_at,
    }));
  } catch (err) {
    return [];
  }
}
