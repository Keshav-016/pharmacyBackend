import { StatusCodes } from 'http-status-codes';
import Quotation from '../models/quotationModel.js';
import { verifyRole } from '../services/helper.js';

export const offer = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const quotation = await Quotation.findOne({
            pharmacistId,
            orderId: req.body.orderId
        });
        if (!!quotation) {
            throw new Error('Offer already made');
        }
        const newOffer = await Quotation.create({
            pharmacistId,
            ...req.body
        });
        const response = await newOffer.save();
        res.status(StatusCodes.OK).json({
            mesage: 'Offer placed successfully',
            data: response
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const deleteOffer = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const offerId = req.query.offerId;
        if (!offerId) throw new Error('please mention offerId');
        const response = await Quotation.findByIdAndDelete({
            offerId,
            pharmacistId
        });
        res.status(StatusCodes.OK).json({
            mesage: 'Offer deleted successfully',
            data: response
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const getOffer = async (req, res, next) => {
    try {
        if (!verifyRole(['user', 'pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const offerId = req.query.offerId;
        if (!offerId) throw new Error('please mention OfferId');
        const data = await Quotation.findOne({ _id: offerId }).populate({
            path: 'medicines.medicineId'
        });
        res.status(StatusCodes.OK).json({
            mesage: 'success',
            data
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const getOffersPharmacist = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const response = await Quotation.find({ pharmacistId }).populate({
            path: 'medicines.medicineId'
        });
        res.status(StatusCodes.OK).json({
            mesage: 'success',
            data: response
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const getOffersUser = async (req, res, next) => {
    try {
        if (!verifyRole(['user', 'admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const orderId = req.query.orderId;
        const response = await Quotation.find({ orderId })
            .populate({
                path: 'medicines.medicineId'
            })
            .populate({ path: 'pharmacistId', populate: { path: 'pharmacyId' } });
        res.status(StatusCodes.OK).json({
            mesage: 'success',
            data: response
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};
