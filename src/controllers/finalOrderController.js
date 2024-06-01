import { StatusCodes } from 'http-status-codes';
import FinalOrder from '../models/finalOrderModel.js';
import Quotation from '../models/quotationModel.js';
import { verifyRole } from '../services/helper.js';
import UserOrder from '../models/userOrderModel.js';

export const getOrderByIdUser = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const id = req.query.orderId;
        if (!id) throw new Error('please enter orderId');
        const response = await FinalOrder.findOne({
            orderId: id,
            userId: userId
        }).populate({
            path: 'quotationId',
            populate: {
                path: 'medicines.medicineId'
            }
        });
        res.status(StatusCodes.OK).send({ message: 'Success', data: response });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const getOrderByIdPharmacist = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const orderId = req.query.orderId;
        if (!orderId) throw new Error('please enter orderId in query');
        const response = await FinalOrder.findOne({
            orderId,
            pharmacistId
        }).populate({
            path: 'quotationId',
            populate: {
                path: 'medicines.medicineId'
            }
        });
        res.status(StatusCodes.OK).send({ message: 'Success', data: response });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const addOrder = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const quotationId = req.body.quotationId;
        const quotation = await Quotation.findOne({ _id: quotationId });
        const newFinalOrder = new FinalOrder({
            userId,
            orderId: quotation.orderId,
            quotationId,
            pharmacistId: quotation.pharmacistId
        });
        await newFinalOrder.save();
        await UserOrder.findByIdAndUpdate(quotation.orderId, { status: 'accepted' });
        res.status(StatusCodes.OK).send({
            message: 'Success',
            data: newFinalOrder
        });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const getOrdersUser = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const response = await FinalOrder.find({ userId }).populate({
            path: 'quotationId',
            populate: {
                path: 'medicines.medicineId'
            }
        });
        res.status(StatusCodes.OK).send({ message: 'Success', data: response });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const getOrdersPharmacist = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const response = await FinalOrder.find({ pharmacistId })
            .populate({
                path: 'quotationId',
                populate: {
                    path: 'medicines.medicineId'
                }
            })
            .populate('orderId')
            .populate('pharmacistId');
        res.status(StatusCodes.OK).send({ message: 'Success', data: response });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const changeStatus = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const orderId = req.query.id;
        const state = req.query.state;
        if (!orderId) throw new Error('please enter order id');
        const response = FinalOrder.findOneAndUpdate({ pharmacistId, orderId }, { status: state });
        res.status(StatusCodes.OK).send({ message: 'Success', data: response });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const declineOrder = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const orderId = req.query.orderId;
        await FinalOrder.findOneAndDelete({ pharmacistId, orderId });
        await UserOrder.findByIdAndUpdate(orderId, { status: 'pending' });
        await Quotation.findOneAndDelete({ pharmacistId, orderId });
        res.status(StatusCodes.OK).send({ message: 'Success', data: null });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};
