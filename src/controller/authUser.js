import { addUser, findUserByUsername, getUserByUserID, updateUserPassword } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getShoppingCartById } from "../models/shoppingCartModel.js";
import sendResponse from "../utils/responseHelper.js";

export const registerUser = async (req, res) => {
    const { fullname, gender, username, password, email, phone, birthday } = req.body;

    try {
        const usernameDB = await findUserByUsername(username);
        console.log(usernameDB)

        if (usernameDB.length > 0) {
            return sendResponse(res, 'error', "User already registered", null, { code: 400 })
        }

        const data = {
            fullname: fullname,
            username: username,
            gender: gender,
            password: await bcrypt.hash(password, 10),
            email: email,
            phone: phone,
            birthday: birthday
        }

        const newData = await addUser(data)

        const user = newData.user.length > 0 ? newData.user[0] : null;
        const shoppingCart = newData.shopping_cart.length > 0 ? newData.shopping_cart[0] : null;

        sendResponse(res, 'success', 'User registered successfully', {
            user,
            shoppingCart
        });

    } catch (error) {
        sendResponse(res, 'error', 'Registration failed', null, { code: 500, details: error.message });
    }
}

// login user
export const loginUser = async (req, res) => {
    const { username, password, rememberMe } = req.body;

    try {
        // Validate username and password for login attempt
        if (!username || !password) {
            return sendResponse(res, 'error', 'Username and password are required', null, { code: 400 });
        }

        // Find user by username
        const findUser = await findUserByUsername(username);
        const user = findUser[0];

        // Check if user exists
        if (!user) {
            return sendResponse(res, 'error', 'User not found', null, { code: 404 });
        }

        // Check if password and hashed password are valid strings
        if (typeof user.password !== 'string' || typeof password !== 'string') {
            console.error('Invalid password format');
            throw new Error('Invalid password format');
        }

        // Compare plaintext password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendResponse(res, 'error', 'Invalid credentials', null, { code: 401 });
        }

        // Generate Access Token
        const accessToken = jwt.sign(
            { userID: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        // Generate Refresh Token (if "Remember Me" is selected)
        const refreshToken = jwt.sign(
            { userID: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' } // Refresh token lasts for 7 days
        );

        // Store Refresh Token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Secure cookie to ensure it is only sent over HTTPS
            sameSite: 'Strict', // Protect against CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // Fetch shopping cart data based on user ID (optional)
        const shoppingCartData = await getShoppingCartById(user.id);
        const shoppingCartID = shoppingCartData[0]?.id;

        // Send response with Access Token (and Refresh Token if needed)
        return sendResponse(res, 'success', 'Login successful', {
            accessToken,
            shoppingCartID
        });

    } catch (error) {
        console.error('Error logging in:', error.message);
        return sendResponse(res, 'error', error.message, null, { code: 500 });
    }
};


export const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies; // Hoặc từ req.body nếu sử dụng POST

    if (!refreshToken) {
        return sendResponse(res, 'error', 'No refresh token provided', null, { code: 401 });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await getUserByUserID(decoded.userID);
        const userID = user[0].id

        if (!user) {
            return sendResponse(res, 'error', 'Invalid refresh token', null, { code: 403 });
        }

        const newAccessToken = jwt.sign({ userID: userID }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        return sendResponse(res, 'success', 'Token refreshed', { accessToken: newAccessToken });

    } catch (error) {
        console.error('Error refreshing token:', error.message);
        return sendResponse(res, 'error', 'Error refreshing token', null, { code: 500 });
    }
};


export const forgotPassword = async (req, res) => {
    const { username, newPassword } = req.body;

    try {
        // Check if the user exists
        const checkUsername = await findUserByUsername(username);

        if (!checkUsername) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's password
        const updatePassword = await updateUserPassword(username, newPassword);
        console.log(updatePassword + 'update password');

        if (updatePassword) {
            return res.status(200).json({ message: 'Password updated successfully', user: updatePassword });
        } else {
            throw new Error('Failed to update password');
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    // delete cookies
    res.clearCookie('userID');
    res.json({ message: 'Logged out' });
}