import express from 'express';
import { forgotPassword, loginUser, registerUser } from '../controller/authUser.js';

const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)
router.post('/forgotPassword', forgotPassword)

export default router;