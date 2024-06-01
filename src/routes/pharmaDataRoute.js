import { Router } from 'express';
import { certificateUpload } from '../middleware/upload.js';
import { addDetails, getDetails, getAllDetails, approve, reject, searchedPharmacy } from '../controllers/pharmaDataController.js';
import validateToken from '../middleware/authentication.js';
import { wrongUrl } from '../controllers/customerController.js';

const pharmaDataRouter = Router();

pharmaDataRouter.post('/register', validateToken, certificateUpload, addDetails);
pharmaDataRouter.get('/get', validateToken, getDetails);
pharmaDataRouter.get('/search', validateToken, searchedPharmacy);
pharmaDataRouter.get('/getAll', validateToken, getAllDetails);
pharmaDataRouter.put('/approve', validateToken, approve);
pharmaDataRouter.delete('/reject', validateToken, reject);

pharmaDataRouter.use(wrongUrl);

export default pharmaDataRouter;
