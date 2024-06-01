import Admin from '../models/adminModel.js';
import { StatusCodes } from 'http-status-codes';
import { verifyRole } from '../services/helper.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminLogin = async (req, res, next) => {
    try {
        const adminData = await Admin.findOne({ email: req.body.email });
        if (!adminData) throw new Error('Email not found!');
        const checkPassword = await bcrypt.compare(req.body.password, adminData.password);
        if (!checkPassword) {
            throw new Error('Invalid password!');
        }
        const secretKey = process.env.SECRET_KEY;
        const accessToken = jwt.sign(
            {
                id: adminData._id,
                role: 'admin'
            },
            secretKey,
            { expiresIn: '1d' }
        );
        return res.status(StatusCodes.ACCEPTED).json({
            data: {
                token: accessToken,
                loggedAt: new Date()
            },
            message: 'Succesfully Signed in'
        });
    } catch (error) {
        next({
            status: StatusCodes.NOT_ACCEPTABLE,
            message: error.message
        });
    }
};

export const getAdminDetails = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        let adminData = await Admin.findById(req.id);
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: adminData
        });
    } catch (error) {
        next({
            status: StatusCodes.NOT_ACCEPTABLE,
            message: error.message
        });
    }
};

export const registerAdmin = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const adminData = new Admin({
            email: req.body.email,
            name: req.body.name,
            password: hashedPassword,
            phone: req.body.phone,
            address: { ...req.body.address }
        });
        await adminData.save();
        return res.status(StatusCodes.ACCEPTED).json({
            data: { adminData: adminData },
            message: 'Succesfully Registered'
        });
    } catch (error) {
        next({
            status: StatusCodes.NOT_ACCEPTABLE,
            message: error.message
        });
    }
};

export const updateAdminDetails = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const adminData = await Admin.findByIdAndUpdate(req.id, req.body, {
            returnOriginal: false
        });
        return res.status(StatusCodes.OK).json({
            message: 'success',
            data: {
                name: adminData.name,
                email: adminData.email,
                address: {
                    building: adminData.address.building,
                    area: adminData.address.area,
                    landmark: adminData.address.landmark,
                    pin: adminData.address.pin
                },
                phone: adminData.phone
            }
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const updateAdminPassword = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        let matchOldPassword = await Admin.findById(req.id);
        const checkPassword = await bcrypt.compare(req.body.password, matchOldPassword.password);

        if (!checkPassword) throw new Error("Old password doesn't match");
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        const adminData = await Admin.findByIdAndUpdate(
            req.id,
            { password: hashedPassword },
            {
                returnOriginal: false
            }
        );
        res.status(StatusCodes.ACCEPTED).json({
            message: 'success',
            data: adminData.password
        });
    } catch (error) {
        next({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message
        });
    }
};

export const adminProfileImage = async (req, res, next) => {
    try {
        if (!verifyRole(['admin'], req.role)) {
            throw new Error('User not authorised');
        }
        const unmodifiedData = await Admin.findById(req.id);
        if (!unmodifiedData.image.includes('defaultImage')) {
            fs.unlink(path.join(__dirname, `../assets/${unmodifiedData.image}`), function (err) {
                if (err) throw err;
            });
        }
        const adminData = await Admin.findByIdAndUpdate(
            req.id,
            {
                image: `profileImages/${req.file.filename}`
            },
            {
                returnOriginal: false
            }
        );
        return res.status(StatusCodes.OK).json({ message: 'success', data: adminData.image });
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
