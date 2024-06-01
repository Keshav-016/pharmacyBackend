import { getAllCustomer, searchedCustomer, getCustomer, sendOtp, verifyOtp, updateCustomer, updateProfileImage, deleteCustomer, wrongUrl } from '../controllers/customerController.js';
import { profileImageUpload } from '../middleware/upload.js';
import { Router } from 'express';
import validateToken from '../middleware/authentication.js';

const router = Router();

router.get('/get-all', validateToken, getAllCustomer);
router.get('/search', validateToken, searchedCustomer);
router.get('/get-customer', validateToken, getCustomer);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.put('/update', validateToken, updateCustomer);
router.put('/update-profile-image', validateToken, profileImageUpload, updateProfileImage);
router.delete('/delete', validateToken, deleteCustomer);

router.use(wrongUrl);

export default router;
