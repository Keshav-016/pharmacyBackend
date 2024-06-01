import { Router } from 'express';
import { register, login, getAll, getPharmacist, updatePharmacist, deletePharmacist, updatePharmacistPassword, updateProfileImage, sendOtp, verifyOtp, forgotPassword } from '../controllers/pharmacistController.js';

import validateToken from '../middleware/authentication.js';
import { profileImageUpload } from '../middleware/upload.js';
import { wrongUrl } from '../controllers/customerController.js';

const pharmacistRouter = Router();

pharmacistRouter.post('/register', register);
pharmacistRouter.post('/login', login);
pharmacistRouter.get('/get-all', validateToken, getAll);
pharmacistRouter.post('/send-otp', sendOtp);
pharmacistRouter.post('/verify-otp', verifyOtp);
pharmacistRouter.put('/forgot-password', forgotPassword);
pharmacistRouter.get('/get-pharmacist', validateToken, getPharmacist);
pharmacistRouter.put('/update-pharmacist', validateToken, updatePharmacist);
pharmacistRouter.put('/update-pharmacist-password', validateToken, updatePharmacistPassword);
pharmacistRouter.put('/update-profile-image', validateToken, profileImageUpload, updateProfileImage);
pharmacistRouter.delete('/delete-pharmacist', validateToken, deletePharmacist);

pharmacistRouter.use(wrongUrl);

export default pharmacistRouter;
