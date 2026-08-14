import { Request, Response } from 'express';
import {
  createReviewService,
  getAdminReviewsService,
  getItemApprovedReviewsService,
  updateReviewStatusService,
} from '../services/review.service';
import { logger } from '../utils/logger';

export async function createReview(req: Request, res: Response) {
  try {
    const { orderId, userId, menuItemId, rating, foodRating, deliveryRating, tags, comment } = req.body;

    const parsedRating = rating !== undefined && rating !== null && rating !== '' ? Number(rating) : 0;
    const parsedFoodRating = foodRating !== undefined && foodRating !== null && foodRating !== '' ? Number(foodRating) : 0;
    const parsedDeliveryRating = deliveryRating !== undefined && deliveryRating !== null && deliveryRating !== '' ? Number(deliveryRating) : 0;

    const overallRating = parsedRating || Math.max(parsedFoodRating, parsedDeliveryRating);

    if (isNaN(overallRating) || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating is required and must be a valid number between 1 and 5' });
    }

    const review = await createReviewService({
      orderId: orderId ? String(orderId) : undefined,
      userId: userId ? String(userId) : (req as any).user?.id || null,
      menuItemId: menuItemId ? String(menuItemId) : undefined,
      rating: Math.round(overallRating),
      foodRating: parsedFoodRating > 0 ? Math.round(parsedFoodRating) : undefined,
      deliveryRating: parsedDeliveryRating > 0 ? Math.round(parsedDeliveryRating) : undefined,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? [tags] : [],
      comment: comment ? String(comment) : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Pending admin approval.',
      data: review,
    });
  } catch (error: any) {
    logger.error('Error creating review:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review', error: error.message });
  }
}

export async function getAdminReviews(req: Request, res: Response) {
  try {
    const { status, menuItemId } = req.query;
    const { reviews, productRatings } = await getAdminReviewsService(
      status as string | undefined,
      menuItemId as string | undefined
    );
    
    if (status === 'approved') {
      return res.status(200).json({
        success: true,
        data: productRatings,
      });
    }

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    logger.error('Error fetching admin reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
}

export async function getItemApprovedReviews(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Menu Item ID is required' });
    }

    const result = await getItemApprovedReviewsService(itemId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error fetching item reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch item reviews', error: error.message });
  }
}

export async function updateReviewStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!id || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid ID and status (approved/rejected) are required' });
    }

    const success = await updateReviewStatusService(id, status, adminNotes);

    if (!success) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Review status updated to ${status} successfully!`,
    });
  } catch (error: any) {
    logger.error('Error updating review status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update review status', error: error.message });
  }
}
