import { Router } from 'express';
import { getOffer, getOffersPharmacist, getOffersUser, offer } from '../controllers/quotationController.js';
import validateToken from '../middleware/authentication.js';
import { wrongUrl } from '../controllers/customerController.js';

const quotationRouter = Router();

quotationRouter.use(validateToken);

quotationRouter.post('/offer', offer);
quotationRouter.get('/get-offer', getOffer);
quotationRouter.get('/get-offers-user', validateToken, getOffersUser);
quotationRouter.get('/get-offers-pharmacist', validateToken, getOffersPharmacist);

quotationRouter.use(wrongUrl);

export default quotationRouter;
