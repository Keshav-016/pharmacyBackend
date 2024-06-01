import { Router } from 'express';
import validateToken from '../middleware/authentication.js';
import { adminLogin, registerAdmin, getAdminDetails, updateAdminDetails, updateAdminPassword, adminProfileImage } from '../controllers/adminControllers.js';
import { profileImageUpload } from '../middleware/upload.js';
import { wrongUrl } from '../controllers/customerController.js';

const router = Router();

router.post('/login', adminLogin);
router.post('/register', registerAdmin);
router.get('/details', validateToken, getAdminDetails);
router.put('/update-details', validateToken, updateAdminDetails);
router.put('/update-password', validateToken, updateAdminPassword);
router.put('/update-image', validateToken, profileImageUpload, adminProfileImage);

router.use(wrongUrl);

export default router;
