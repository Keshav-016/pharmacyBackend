import { Router } from 'express';
import { addOrder, getOrderByIdPharmacist, getOrderByIdUser, getOrdersPharmacist, getOrdersUser, declineOrder } from '../controllers/finalOrderController.js';
import validateToken from '../middleware/authentication.js';
import { wrongUrl } from '../controllers/customerController.js';

const finalOrderRouter = Router();

finalOrderRouter.use(validateToken);

finalOrderRouter.get('/get-order-user', getOrderByIdUser), finalOrderRouter.get('/get-order-pharmacist', getOrderByIdPharmacist);
finalOrderRouter.get('/get-orders-user', getOrdersUser);
finalOrderRouter.get('/get-orders-pharmacist', getOrdersPharmacist);
finalOrderRouter.post('/add-order', validateToken, addOrder);
finalOrderRouter.delete('/decline-order', validateToken, declineOrder);

finalOrderRouter.use(wrongUrl);

export default finalOrderRouter;
