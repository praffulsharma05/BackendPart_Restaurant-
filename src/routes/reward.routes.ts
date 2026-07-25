import { Router } from 'express';
import { rewardController } from '../controllers/reward.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/summary', authenticate, rewardController.getRewardSummary);

export default router;
