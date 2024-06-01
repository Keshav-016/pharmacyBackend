import { StatusCodes } from 'http-status-codes';
import Customer from '../models/customerModel.js';
import Cart from '../models/cartModel.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../services/nodeMailer.js';
import otpGenerator from 'otp-generator';
import Otp from '../models/otpModel.js';
import bcrypt from 'bcrypt';
import { verifyRole } from '../services/helper.js';
import Address from '../models/addressModel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const getAllCustomer = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const customersData = await Customer.find()
            .skip(req.query.page * 10)
            .limit(10)
            .populate({ path: 'addressId' });
        const totalCustomer = await Customer.find().count();
        return res.status(StatusCodes.OK).json({
            message: 'success',
            total: totalCustomer,
            data: customersData
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const searchedCustomer = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const customersData = await Customer.find({ name: { $regex: req.query.name, $options: 'i' } })
            .limit(10)
            .populate({ path: 'addressId' });
        return res.status(StatusCodes.OK).json({
            message: 'success',
            data: customersData
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const getCustomer = async (req, res, next) => {
    try {
        let customerData = await Customer.findById(req.id);
        if (customerData?.dob)
            customerData = {
                ...customerData.toObject(),
                dob: `${customerData?.dob?.toISOString()?.substring(0, 10)}`
            };
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: customerData
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const sendOtp = async (req, res, next) => {
    try {
        if (!req.body.email.match(emailRegex)) {
            throw new Error('Email is not valid');
        }
        await Otp.findOneAndDelete({ email: req.body.email });
        const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log(otp);
        // sendEmail(req.body.email,otp);
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpData = new Otp({
            email: req.body.email,
            otp: hashedOtp
        });
        await otpData.save();
        return res.status(StatusCodes.OK).json({ message: 'success', data: hashedOtp });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const dbData = await Otp.findOne({ email: req.body.email });
        if (!dbData) {
            throw new Error('Otp expired please generate a new otp!!!');
        }
        const userAuth = await bcrypt.compare(req.body.otp, dbData.otp);
        if (!userAuth) {
            throw new Error('Enter a valid Otp');
        }
        const oldCustomer = await Customer.findOne({ email: req.body.email });
        if (oldCustomer && oldCustomer.isBlocked === true) {
            throw new Error('You have been blocked by the admin');
        }
        if (!oldCustomer) {
            const customerData = new Customer({
                ...req.body
            });
            await customerData.save();
            const findCustomer = await Customer.findOne({
                email: req.body.email
            });
            const createCart = new Cart({
                userId: findCustomer._id
            });
            await createCart.save();
        }
        const CustomerData = await Customer.findOne({ email: req.body.email });
        const secretKey = process.env.SECRET_KEY;
        const accessToken = jwt.sign(
            {
                id: CustomerData._id,
                role: 'user'
            },
            secretKey,
            { expiresIn: '1d' }
        );
        return res.status(StatusCodes.ACCEPTED).json({
            data: {
                token: accessToken,
                customerData: CustomerData,
                TTL: '1d',
                loggedAt: new Date()
            },
            message: 'Succesfully Signed in'
        });
    } catch (error) {
        next({ status: StatusCodes.BAD_REQUEST, message: error.message });
    }
};

export const updateCustomer = async (req, res, next) => {
    try {
        if (!verifyRole(['user', 'admin'], req.role)) {
            throw new Error('User not authorised');
        }
        let id = req.id;
        if (req.role === 'admin') {
            id = req.query.id;
        }
        const customersData = await Customer.findByIdAndUpdate(id, req.body, {
            returnOriginal: false
        });
        return res.status(StatusCodes.OK).json({ message: 'success', data: customersData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const updateProfileImage = async (req, res, next) => {
    try {
        if (!verifyRole(['user'], req.role)) {
            throw new Error('User not authorised');
        }
        const unmodifiedData = await Customer.findById(req.id);
        if (!unmodifiedData.image.includes('defaultImage')) {
            fs.unlink(path.join(__dirname, `../assets/${unmodifiedData.image}`), function (err) {
                if (err) throw err;
            });
        }
        const customersData = await Customer.findByIdAndUpdate(
            req.id,
            {
                image: `profileImages/${req.file.filename}`
            },
            {
                returnOriginal: false
            }
        );
        return res.status(StatusCodes.OK).json({ message: 'success', data: customersData.image });
    } catch (error) {
        fs.unlink(path.join(__dirname, `../assets/${unmodifiedData.image}`), function (err) {
            if (err) throw err;
        });

        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const deleteCustomer = async (req, res, next) => {
    try {
        if (!verifyRole(['user', 'admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const id = req.role === 'admin' ? req.query.id : req.id;
        const customersData = await Customer.findByIdAndDelete(id);
        await Cart.findOneAndDelete({ userId: id });
        await Address.deleteMany({ userId: id });
        const totalCustomer = await Customer.find().count();
        return res.status(StatusCodes.OK).json({
            message: 'success',
            data: customersData,
            totalCustomer: totalCustomer
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const wrongUrl = async (req, res) => {
    res.status(StatusCodes.BAD_REQUEST).json({
        data: null,
        message: 'Wrong url'
    });
};
