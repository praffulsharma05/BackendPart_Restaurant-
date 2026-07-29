import { dbPool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const restaurantService = {
  async getRestaurantDetails() {
    const [infoRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_info LIMIT 1');
    const [timingsRows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM restaurant_timings');

    const info = infoRows[0] || {
      name: 'Luxe Dine Restaurant',
      logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
      phone: '+1 800-589-3463',
      address: '100 Gourmet Boulevard, Suite 400',
      tax_percentage: 5.0,
      service_charge_percentage: 2.5,
      upi_id: 'luxedine@bank',
      qr_payment_image_url: 'https://images.unsplash.com/photo-1556742049-0a67dd35f3d7?w=500',
    };

    return {
      info: {
        name: info.name,
        logoUrl: info.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
        phone: info.phone,
        address: info.address,
        taxPercentage: Number(info.tax_percentage),
        serviceChargePercentage: Number(info.service_charge_percentage),
        qrDetails: {
          upiId: info.upi_id,
          qrCodeImageUrl: info.qr_payment_image_url,
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
    const { name, logoUrl, phone, address, taxPercentage, serviceChargePercentage, upiId, qrPaymentImageUrl } = data;
    await dbPool.query(
      `UPDATE restaurant_info SET 
        name = COALESCE(?, name),
        logo_url = COALESCE(?, logo_url),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        tax_percentage = COALESCE(?, tax_percentage),
        service_charge_percentage = COALESCE(?, service_charge_percentage),
        upi_id = COALESCE(?, upi_id),
        qr_payment_image_url = COALESCE(?, qr_payment_image_url)
       WHERE id = 1`,
      [name, logoUrl, phone, address, taxPercentage, serviceChargePercentage, upiId, qrPaymentImageUrl]
    );
    return this.getRestaurantDetails();
  },
};
