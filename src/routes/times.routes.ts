import { Router } from 'express';
import * as ctrl from '../controllers/times.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ctrl.listTimes);
router.get('/:id', ctrl.getTime);
router.post('/', requireAuth, ctrl.createTime);
router.put('/:id', requireAuth, ctrl.updateTime);
router.delete('/:id', requireAuth, ctrl.deleteTime);

export default router;
