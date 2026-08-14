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
    const { orderId, userId, menuItemId, rating, tags, comment } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: 'Rating is required and must be between 1 and 5' });
    }

    const review = await createReviewService({
      orderId,
      userId: userId || (req as any).user?.id || null,
      menuItemId,
      rating: Number(rating),
      tags,
      comment,
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
    const { status } = req.query;
    const reviews = await getAdminReviewsService(status as string | undefined);
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
