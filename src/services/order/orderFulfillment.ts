import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { CreateOrderInput } from '../../types';

export async function processOrderFulfillment(
  connection: PoolConnection,
  orderId: string,
  targetUserId: string,
  input: CreateOrderInput
): Promise<void> {
  try {
    if (input.orderType === 'Car Order' && input.carDetails) {
      await connection.query(
        'INSERT INTO order_fulfillment_car (order_id, car_number, car_model, parking_spot) VALUES (?, ?, ?, ?)',
        [orderId, input.carDetails.carNumber, input.carDetails.carModel, input.carDetails.parkingSpot || '']
      );

      if (targetUserId && input.carDetails.carNumber && input.carDetails.carNumber.trim()) {
        try {
          const cleanCar = input.carDetails.carNumber.trim();
          const carModelVal = input.carDetails.carModel || 'Car';
          const [existingVeh] = await connection.query<RowDataPacket[]>(
            'SELECT id FROM saved_vehicles WHERE user_id = ? AND car_number = ?',
            [targetUserId, cleanCar]
          );
          if (existingVeh.length === 0) {
            const vehId = `v_${Date.now()}`;
            await connection.query(
              'INSERT INTO saved_vehicles (id, user_id, car_number, car_model, is_default) VALUES (?, ?, ?, ?, ?)',
              [vehId, targetUserId, cleanCar, carModelVal, true]
            );
          }
        } catch (_vehSaveErr) {}
      }
    } else if (input.orderType === 'Dine In' && input.dineInDetails) {
      await connection.query(
        'INSERT INTO order_fulfillment_dine_in (order_id, table_number, seat_number) VALUES (?, ?, ?)',
        [orderId, input.dineInDetails.tableNumber, input.dineInDetails.seatNumber || '']
      );
    } else if ((input.orderType === 'Pre Order' || input.orderType === 'Take Away') && input.preOrderDetails) {
      await connection.query(
        'INSERT INTO order_fulfillment_pre_order (order_id, scheduled_date, scheduled_time) VALUES (?, ?, ?)',
        [orderId, input.preOrderDetails.scheduledDate, input.preOrderDetails.scheduledTime]
      );
    }
  } catch (_fulErr) {}
}
