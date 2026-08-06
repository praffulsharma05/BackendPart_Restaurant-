import { Router } from 'express';
import { rewardController } from '../controllers/reward.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/summary', optionalAuthenticate, rewardController.getRewardSummary);
router.get('/config', rewardController.getRewardSettings);
router.put('/config', rewardController.updateRewardSettings);

export default router;
