import Medicine from '../models/medicineModel.js';
import { StatusCodes } from 'http-status-codes';
import { verifyRole } from '../services/helper.js';

export const addMedicine = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const nameArray = req.body.name.split(' ');
        const capitalisedName = nameArray.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`);
        const medicineName = capitalisedName.join(' ');
        const medicine = new Medicine({
            ...req.body,
            name: medicineName
        });
        const data = await medicine.save();
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data
        });
    } catch (error) {
        next({
            status: StatusCodes.NOT_ACCEPTABLE,
            message: error.message
        });
    }
};

export const getAll = async (req, res, next) => {
    try {
        const skipData = req.query.page * 12;
        const medicineData = await Medicine.find().skip(skipData).limit(12);
        const total = await Medicine.find().count();
        return res.status(StatusCodes.OK).json({ message: 'success', data: { medicineData, total } });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const getMedicine = async (req, res, next) => {
    try {
        const medicineData = await Medicine.findById(req.query.medicineId);
        const updatedData = {
            ...medicineData.toObject(),
            previewImage: 'medicine/drop.png',
            previewTop: 'medicine/dropBack.png',
            previewBottom: 'medicine/dropFront.png',
            previewMiddle: 'medicine/dropTop.png'
        };
        return res.status(StatusCodes.OK).json({ message: 'success', data: updatedData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const updateMedicine = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const nameArray = req.body.name.split(' ');
        const capitalisedName = nameArray.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`);
        const medicineName = capitalisedName.join(' ');
        const medicineData = await Medicine.findByIdAndUpdate(
            req.query.id,
            {
                ...req.body,
                name: medicineName
            },
            { returnOriginal: false }
        );
        return res.status(StatusCodes.OK).json({ message: 'success', data: medicineData });
    } catch (error) {
        next({ status: StatusCodes.CONFLICT, message: error.message });
    }
};

export const deleteMedicine = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const medicineData = await Medicine.findByIdAndDelete(req.query.id);
        return res.status(StatusCodes.OK).json({ message: 'success', data: medicineData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const searchedMedicine = async (req, res, next) => {
    try {
        let medicineName = req.query.name;
        medicineName = medicineName[0].toUpperCase() + medicineName.slice(1);
        const medicineData = await Medicine.find({
            name: { $regex: medicineName }
        })
            .sort({ name: 1 })
            .limit(10);
        return res.status(StatusCodes.OK).json({ message: 'success', data: medicineData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const wrongUrl = (req, res) => {
    res.status(StatusCodes.BAD_REQUEST).json({
        data: null,
        message: 'Wrong url'
    });
};
