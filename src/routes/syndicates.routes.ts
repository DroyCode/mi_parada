import { Router } from 'express';
import * as ctrl from '../controllers/syndicates.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ctrl.listSyndicates);
router.get('/:id', ctrl.getSyndicate);
router.post('/', requireAuth, ctrl.createSyndicate);
router.put('/:id', requireAuth, ctrl.updateSyndicate);
router.delete('/:id', requireAuth, ctrl.deleteSyndicate);

export default router;
