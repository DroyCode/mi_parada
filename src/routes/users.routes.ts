import { Router } from 'express';
import * as ctrl from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, ctrl.listUsers);
router.get('/:id', requireAuth, ctrl.getUser);
router.delete('/:id', requireAuth, ctrl.deleteUser);

export default router;
