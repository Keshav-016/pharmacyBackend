import { updateCart, getCartData, wrongUrl } from '../controllers/cartController.js';
import { Router } from 'express';
import validateToken from '../middleware/authentication.js';

const router = Router();

router.use(validateToken);

router.put('/update-cart', updateCart);
router.get('/get-cart-data', getCartData);

router.use(wrongUrl);

export default router;
