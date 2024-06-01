import { StatusCodes } from 'http-status-codes';
import Pharmacy from '../models/prarmaDataModel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyRole } from '../services/helper.js';
import Pharmacist from '../models/pharmacistModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addDetails = async (req, res, next) => {
    if (!verifyRole(['pharmacist'], req.role)) {
        throw new Error('User not authorised');
    }
    const pharmacistId = req.id;
    const { files, body } = req;
    try {
        const data = {
            pharmacistId,
            name: body.name,
            registration_no: body.registration_no,
            email: body.email,
            phone: body.phone,
            address: {
                building: body.building,
                area: body.area,
                landmark: body.landmark,
                pin: body.pin
            },
            certificates: [
                {
                    name: body.certificate1,
                    file: `registrations/${files[0].filename}`
                },
                {
                    name: body.certificate2,
                    file: `registrations/${files[1].filename}`
                }
            ],
            location: { coordinates: [body.latitude, body.longitude] }
        };
        const newPharmacy = new Pharmacy(data);
        const response = await newPharmacy.save();
        res.status(StatusCodes.OK).json({
            message: 'Details submitted Successfully'
        });
    } catch (e) {
        req.files.forEach((item) => {
            fs.unlinkSync(path.join(__dirname, `../assets/registrations/${item.filename}`));
        });
        if (e.message.includes('duplicate'))
            next({
                status: StatusCodes.BAD_REQUEST,
                message: 'Details already present'
            });
        else
            next({
                status: StatusCodes.CONFLICT,
                message: e.message
            });
    }
};

export const getAllDetails = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const page = req.query.page;
        const total = await Pharmacy.find().count();
        const data = await Pharmacy.find()
            .populate({
                path: 'pharmacistId'
            })
            .skip(page * 10)
            .limit(page);

        res.status(StatusCodes.OK).json({
            data: { pharmaData: data, total },
            message: 'Success'
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: 'An error has occured'
        });
    }
};

export const getDetails = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist', 'admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const data = await Pharmacy.findOne({ pharmacistId: req.id }).populate({ path: 'pharmacistId' });
        res.status(StatusCodes.OK).json({
            data,
            message: 'Success'
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const searchedPharmacy = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        let pharmacyName = req.query.name;
        const pharmacyData = await Pharmacy.find({
            name: { $regex: pharmacyName, $options: 'i' }
        })
            .populate({ path: 'pharmacistId' })
            .sort({ name: 1 })
            .limit(10);
        return res.status(StatusCodes.OK).json({ message: 'success', data: pharmacyData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const approve = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const id = req.query.id;
        const data = await Pharmacy.findByIdAndUpdate(id, { isApproved: true }, { returnOriginal: false });
        await Pharmacist.findByIdAndUpdate(data.pharmacistId, { pharmacyId: id });
        res.status(StatusCodes.OK).json({
            data,
            message: 'Success'
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const reject = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const id = req.query.id;
        const data = await Pharmacy.findById(id);
        await Pharmacist.findByIdAndDelete(data.pharmacistId);
        await Pharmacy.findByIdAndDelete(id);
        res.status(StatusCodes.OK).json({
            data,
            message: 'Success'
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const deleteDetails = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const data = await Pharmacy.deleteOne({ pharmacistId: req.id });
        res.status(StatusCodes.OK).json({
            data,
            message: 'Success'
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};
