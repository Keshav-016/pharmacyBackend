import { Router } from 'express';
import { addAddress, deleteAddress, getAddress, getAddressById, updateAddress, wrongUrl } from '../controllers/addressController.js';
import validateToken from '../middleware/authentication.js';

const router = Router();

router.use(validateToken);

router.post('/add-address', addAddress);
router.get('/get-address', validateToken, getAddress);
router.get('/get-single-address', validateToken, getAddressById);
router.put('/update-address', updateAddress);
router.delete('/delete-address', deleteAddress);

router.use(wrongUrl);

export default router;
