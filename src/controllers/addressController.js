import Address from '../models/addressModel.js';
import { StatusCodes } from 'http-status-codes';
import { verifyRole } from '../services/helper.js';
import Customer from '../models/customerModel.js';

export const addAddress = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const address = new Address({
            ...req.body,
            userId: req.id,
            location: { coordinates: req.body.coordinates }
        });
        await address.save();
        const customer = await Customer.findById(req.id);
        if (customer?.addressId === undefined) {
            const address = await Address.findOne({ userId: req.id });
            await Customer.findByIdAndUpdate(req.id, { addressId: address._id });
        }
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: req.body
        });
    } catch (error) {
        next({
            status: StatusCodes.NOT_ACCEPTABLE,
            message: error.message
        });
    }
};

export const getAddress = async (req, res, next) => {
    try {
        const addressData = await Address.find({ userId: req.id });
        return res.status(StatusCodes.OK).json({ message: 'success', data: addressData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const getAddressById = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const addressData = await Address.findById(req.query.id);
        return res.status(StatusCodes.OK).json({ message: 'success', data: addressData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const updateAddress = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        if (req.body.type === 'home' || req.body.type === 'work') {
            const addressCheck = await Address.findOne({
                userId: req.id,
                type: req.body.type
            });
            if (addressCheck) {
                throw new Error('Address with same type already exists. try to add in other');
            }
        }
        const addressData = await Address.findByIdAndUpdate(req.query.id, req.body, { returnOriginal: false });
        return res.status(StatusCodes.OK).json({ message: 'success', data: addressData });
    } catch (error) {
        next({ status: StatusCodes.CONFLICT, message: error.message });
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        let noOfAddress = await Address.find({ userId: req.id });
        noOfAddress = noOfAddress.length;
        if (noOfAddress === 1) {
            throw new Error('One mandatory address required');
        }
        const addressData = await Address.findByIdAndDelete(req.query.id);
        const customerAddress = await Customer.findById(req.id);
        if (String(customerAddress.addressId) === String(addressData._id)) {
            const oldAddress = await Address.findOne({ userId: req.id });
            await Customer.findByIdAndUpdate(req.id, { addressId: oldAddress._id });
        }
        return res.status(StatusCodes.OK).json({ message: 'success', data: addressData });
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
