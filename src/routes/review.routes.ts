import { Router } from 'express';
import {
  createReview,
  getAdminReviews,
  getItemApprovedReviews,
  updateReviewStatus,
} from '../controllers/review.controller';

const router = Router();

// Public / Customer review routes
router.post('/', createReview);
router.get('/item/:itemId', getItemApprovedReviews);

// Admin review moderation routes
router.get('/admin', getAdminReviews);
router.patch('/admin/:id/status', updateReviewStatus);

export default router;
