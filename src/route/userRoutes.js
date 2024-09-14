import express from 'express';
import { forgotPassword, loginUser, registerUser, refreshToken } from '../controller/authUser.js';

const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)
router.post('/forgotPassword', forgotPassword)
router.post('/refresh-token', refreshToken);

export default router;