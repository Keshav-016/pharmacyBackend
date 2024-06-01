import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

const secretKey = process.env.SECRET_KEY;

const validateToken = async (req, res, next) => {
    try {
        let token;
        let authHeader = req.headers.Authorization || req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
            jwt.verify(token, secretKey, (error, decoded) => {
                if (error) {
                    throw new Error('User is not authorized');
                }
                req.id = decoded.id;
                req.role = decoded.role;
                next();
            });
        } else {
            throw new Error('Token is missing!!!');
        }
    } catch (error) {
        next({ status: StatusCodes.UNAUTHORIZED, message: error.message });
    }
};

export default validateToken;
