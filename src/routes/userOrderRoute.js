import { Router } from 'express';
import { prescriptionUpload } from '../middleware/upload.js';
import { addOrder, closeOrder, deleteOrder, getOrder, pharmacistGetAll, userGetAll, getAll } from '../controllers/userOrderController.js';
import validateToken from '../middleware/authentication.js';
import { wrongUrl } from '../controllers/customerController.js';

const userOrderRouter = Router();

userOrderRouter.use(validateToken);

userOrderRouter.post('/make-order', prescriptionUpload, addOrder);
userOrderRouter.put('/close-order', closeOrder);
userOrderRouter.delete('/delete-order', deleteOrder);
userOrderRouter.get('/get-order', getOrder);
userOrderRouter.get('/user-get-all', userGetAll);
userOrderRouter.get('/get-all', getAll);
userOrderRouter.get('/pharmacist-get-all', pharmacistGetAll);

userOrderRouter.use(wrongUrl);

export default userOrderRouter;
