import { addMedicine, getAll, getMedicine, updateMedicine, searchedMedicine, deleteMedicine, wrongUrl } from '../controllers/medicineController.js';
import { Router } from 'express';
import validateToken from '../middleware/authentication.js';

const router = Router();

router.post('/add-medicine', validateToken, addMedicine);
router.get('/get-all', getAll);
router.get('/get-medicine', getMedicine);
router.get('/search-medicine', searchedMedicine);
router.put('/update-medicine', validateToken, updateMedicine);
router.delete('/delete-medicine', validateToken, deleteMedicine);

router.use(wrongUrl);

export default router;
