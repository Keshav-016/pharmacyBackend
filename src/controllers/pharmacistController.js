import { StatusCodes } from 'http-status-codes';
import Pharmacist from '../models/pharmacistModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyRole } from '../services/helper.js';
import Pharmacy from '../models/prarmaDataModel.js';
import otpGenerator from 'otp-generator';
import Otp from '../models/otpModel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const register = async (req, res, next) => {
    try {
        if (!req.body.email.match(emailRegex)) {
            throw new Error('Email is not valid');
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userData = new Pharmacist({
            ...req.body,
            password: hashedPassword
        });
        await userData.save();
        return res.status(StatusCodes.ACCEPTED).json({ data: 'successfully registered', message: 'success' });
    } catch (error) {
        if (error.message.includes('duplicate')) {
            next({
                status: StatusCodes.BAD_GATEWAY,
                message: 'User already exists'
            });
        } else {
            next({ status: StatusCodes.BAD_REQUEST, message: error.message });
        }
    }
};

export const login = async (req, res, next) => {
    try {
        const userAuth = await Pharmacist.findOne({ email: req.body.email });
        if (!userAuth) {
            throw new Error("User doesn't exist");
        }
        if (userAuth.isBlocked) {
            throw new Error('You have been blocked by the admin');
        }
        const passwordMatch = await bcrypt.compare(req.body.password, userAuth.password);
        if (!passwordMatch) {
            throw new Error('Wrong Password');
        }
        const secretKey = process.env.SECRET_KEY;
        const accessToken = jwt.sign(
            {
                id: userAuth._id,
                role: 'pharmacist'
            },
            secretKey,
            { expiresIn: '30d' }
        );
        return res.status(StatusCodes.ACCEPTED).json({
            data: { token: accessToken, name: userAuth.name },
            message: 'Succesfully logged in'
        });
    } catch (error) {
        next({ status: StatusCodes.NOT_FOUND, message: error.message });
    }
};

export const sendOtp = async (req, res, next) => {
    try {
        if (!(await Pharmacist.findOne({ email: req.body.email }))) {
            throw new Error("User doesn't exist");
        }
        const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log(otp);
        const hashedOtp = await bcrypt.hash(otp, 10);
        await Otp.findOneAndDelete({ email: req.body.email });
        const otpData = await Otp.create({
            email: req.body.email,
            otp: hashedOtp
        });
        res.status(StatusCodes.OK).json({
            data: otpData,
            message: 'Succesfully Signed in'
        });
    } catch (error) {
        next({ status: StatusCodes.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const otpData = await Otp.findOne({ email: req.body.email });
        if (otpData === undefined) {
            throw new Error('Otp expired try again');
        }
        const check = await bcrypt.compare(req.body.otp, otpData.otp);
        if (!check) {
            throw new Error('Wrong otp');
        }
        res.status(StatusCodes.OK).json({
            data: null,
            message: 'Access granted'
        });
    } catch (error) {
        next({ status: StatusCodes.BAD_REQUEST, message: error.message });
    }
};

export const getAll = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistData = await Pharmacist.find({});
        return res.status(StatusCodes.OK).json({ message: 'success', data: pharmacistData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const getPharmacist = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const userData = await Pharmacist.findById(req.id);
        if (userData.isBlocked) {
            throw new Error('You have been blocked by the admin');
        }
        const pharmacyData = await Pharmacy.findOne({ pharmacistId: req.id });
        const pharmacistData = {
            ...userData.toObject(),
            pharmacyName: pharmacyData.name,
            registrationNo: pharmacyData.registration_no
        };
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: pharmacistData
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const updatePharmacist = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist', 'admin'], req.role)) {
            throw new Error('User not authorised');
        }
        let pharmacistId = req.id;
        if (req.role === 'admin') {
            pharmacistId = req.query.id;
        }
        const usersdata = await Pharmacist.findByIdAndUpdate(pharmacistId, req.body, {
            returnOriginal: false
        });
        return res.status(StatusCodes.OK).json({ message: 'success', data: usersdata });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const usersData = await Pharmacist.findOneAndUpdate(
            { email: req.body.email },
            {
                password: hashedPassword
            },
            {
                returnOriginal: false
            }
        );
        return res.status(StatusCodes.OK).json({ message: 'success', data: usersData });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const deletePharmacist = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const pharmacistId = req.id;
        const usersdata = await Pharmacist.findByIdAndDelete(pharmacistId);
        return res.status(StatusCodes.OK).json({ message: 'success', data: usersdata });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const updateProfileImage = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        const unmodifiedData = await Pharmacist.findById(req.id);
        if (!unmodifiedData.image.includes('defaultPharmacistImage')) {
            fs.unlink(path.join(__dirname, `../assets/${unmodifiedData.image}`), function (err) {
                if (err) throw err;
            });
        }
        const pharmacistData = await Pharmacist.findByIdAndUpdate(
            req.id,
            {
                image: `profileImages/${req.file.filename}`
            },
            {
                returnOriginal: false
            }
        );
        return res.status(StatusCodes.OK).json({ message: 'success', data: pharmacistData.image });
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

export const updatePharmacistPassword = async (req, res, next) => {
    try {
        if (!verifyRole(['pharmacist'], req.role)) {
            throw new Error('User not authorised');
        }
        let matchOldPassword = await Pharmacist.findById(req.id);
        const checkPassword = await bcrypt.compare(req.body.password, matchOldPassword.password);

        if (!checkPassword) throw new Error("Old password doesn't match");
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        const pharmacistData = await Pharmacist.findByIdAndUpdate(
            req.id,
            { password: hashedPassword },
            {
                returnOriginal: false
            }
        );
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: pharmacistData.password
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};
