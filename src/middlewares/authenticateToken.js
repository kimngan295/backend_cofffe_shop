import jwt from 'jsonwebtoken';
import sendResponse from "../utils/responseHelper.js";
import dotenv from 'dotenv';

dotenv.config();

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return sendResponse(res, 'error', 'Access denied', null, { code: 401 });

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
        console.log('decoded: ', decoded);
        req.user = decoded; // Lưu thông tin user vào req
        next();
    } catch (error) {
        console.error('Token verification error: ', error.message);
        sendResponse(res, 'error', 'Invalid token', null, { code: 400 });
    }
};

export default authenticate;

