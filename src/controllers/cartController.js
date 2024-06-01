import Cart from '../models/cartModel.js';
import { StatusCodes } from 'http-status-codes';
import { verifyRole } from '../services/helper.js';

export const updateCart = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const cartData = await Cart.findOne({ userId: req.id });
        if (req.body.quantity === 0) {
            cartData.cartItems = cartData.cartItems.filter((item) => String(item.medicineId) !== req.body.medicineId);
        } else {
            const index = cartData.cartItems.findIndex((item) => String(item.medicineId) === req.body.medicineId);
            if (index !== -1) cartData.cartItems[index].quantity = req.body.quantity;
            else cartData.cartItems.push(req.body);
        }
        const updatedData = await Cart.findOneAndUpdate(
            { userId: req.id },
            {
                cartItems: cartData.cartItems,
                userId: req.id
            },
            { returnOriginal: false }
        );
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: updatedData
        });
    } catch (error) {
        next({
            status: StatusCodes.NOT_ACCEPTABLE,
            message: error.message
        });
    }
};

export const getCartData = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const cartData = await Cart.findOne({ userId: req.id }).populate({ path: medicines.medicineId });
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: cartData
        });
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
