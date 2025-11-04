import { Router } from 'express';
import * as ctrl from '../controllers/stops.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ctrl.listStops);
router.get('/:id', ctrl.getStop);
router.post('/', requireAuth, ctrl.createStop);
router.put('/:id', requireAuth, ctrl.updateStop);
router.delete('/:id', requireAuth, ctrl.deleteStop);

export default router;
