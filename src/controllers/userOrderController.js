import UserOrder from '../models/userOrderModel.js';
import Cart from '../models/cartModel.js';
import { StatusCodes } from 'http-status-codes';
import Pharmacy from '../models/prarmaDataModel.js';
import Address from '../models/addressModel.js';
import { verifyRole } from '../services/helper.js';
import Quotation from '../models/quotationModel.js';

export const addOrder = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const files = req.files;
        const prescriptions = files !== undefined ? files.map((item) => `prescriptions/${item.filename}`) : '';
        const cartData = await Cart.findOne({ userId });
        if (cartData.cartItems.length === 0 && req.files.length === 0) throw new Error('No items in the cart! Unable to place order');
        const address = await Address.findOne({
            userId,
            _id: req.body.addressId
        });
        const newOrder = await UserOrder.create({
            userId,
            medicines: cartData.cartItems,
            prescriptions,
            address: address.address,
            location: address.location
        });
        await newOrder.save();
        await Cart.findOneAndUpdate({ userId }, { cartItems: [] }, { new: true });
        res.status(StatusCodes.OK).json({
            mesage: 'Order placed successfully'
        });
    } catch (e) {
        next({
            status: StatusCodes.CONFLICT,
            message: e.message
        });
    }
};

export const closeOrder = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const orderId = req.query.orderId;
        const response = await UserOrder.findOneAndUpdate(
            { _id: orderId, userId },
            {
                isClosed: true
            },
            { new: true }
        );
        res.status(StatusCodes.OK).send({
            message: 'Order Successfully closed',
            data: response
        });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const orderId = req.query.orderId;
        if (!orderId) throw new Error('please enter the "orderId" in query');
        const response = await UserOrder.findByIdAndDelete({
            userId,
            _id: orderId
        });
        res.status(StatusCodes.OK).send({
            message: 'Order Successfully deleted',
            data: response
        });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const getOrder = async (req, res, next) => {
    try {
        if (!verifyRole(['user', 'pharmacist', 'admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const orderId = req.query.orderId;
        if (!orderId) throw new Error('please give orderId in query parameter');
        let data;
        if (req.role === 'admin') {
            data = await UserOrder.findOne({ _id: orderId }).populate({
                path: 'medicines.medicineId'
            });
        } else {
            data = await UserOrder.findOne({ _id: orderId, userId }).populate({
                path: 'medicines.medicineId'
            });
        }
        res.status(StatusCodes.OK).send({ message: 'Success', data });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const getAll = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const total = await UserOrder.find().count();
        const data = await UserOrder.find()
            .populate({
                path: 'medicines.medicineId'
            })
            .populate({ path: 'userId' })
            .skip(req.query.page * 10)
            .limit(10);
        res.status(StatusCodes.OK).send({
            message: 'Success',
            data: { orderData: data, total: total }
        });
    } catch (error) {
        next({ status: StatusCodes.CONFLICT, message: error.message });
    }
};

export const userGetAll = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const userId = req.id;
        const data = await UserOrder.find({ userId })
            .populate({
                path: 'medicines.medicineId'
            })
            .populate({ path: 'userId' });
        res.status(StatusCodes.OK).send({
            message: 'Success',
            data
        });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};

export const pharmacistGetAll = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const id = req.id;
        const pharmacy = await Pharmacy.findOne({ pharmacistId: id });
        const coordinates = pharmacy.location.coordinates;
        const data = await UserOrder.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates },
                    $minDistance: 0,
                    $maxDistance: 10000
                }
            }
        })
            .populate({
                path: 'medicines.medicineId'
            })
            .populate({
                path: 'userId'
            });
        const quotationOrderIds = await Quotation.distinct('orderId', {
            pharmacistId: id
        });
        const myIds = quotationOrderIds.map((item) => item.toString());
        const response = data.filter((order) => !myIds.includes(order._id.toString()));
        res.status(StatusCodes.OK).send({
            message: 'Success',
            data: response
        });
    } catch (e) {
        next({ status: StatusCodes.CONFLICT, message: e.message });
    }
};
