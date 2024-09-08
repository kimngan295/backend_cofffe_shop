import { addUser, findUserByUsername, getUserByUserID, updateUserPassword } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getShoppingCartById } from "../models/orderModel.js";

export const registerUser = async (req, res) => {
    const { fullname, gender, username, password, email, phone, birthday } = req.body;

    try {

        const usernameDB = await findUserByUsername(username);
        console.log(usernameDB)

        if (usernameDB.length > 0) {
            return res.status(409).json({ message: 'Username already exists', user: usernameDB });
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

        const newdata = await addUser(data)
        console.log(newdata)
        res.status(201).json({
            message: 'User registered successfully',
            user: newdata.user,
            shoppingCart: newdata.shopping_cart
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error registering user',
            error: error.message
        });
    }
}

export const loginUser = async (req, res) => {
    const { username, password, rememberMe } = req.body;

    const userID = req.cookies.userID;
    console.log("User ID: " + userID)

    try {
        // Check if user is already logged in
        if (userID) {
            const getUser = await getUserByUserID(userID)

            if (getUser.length > 0) {
                const checkUsername = getUser[0].username
                if (checkUsername === username) {
                    const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    const shoppingCartData = await getShoppingCartById(userID)
                    console.log("Shopping Cart Data: " + shoppingCartData)
                    const shoppingCartID = shoppingCartData[0].id
                    res.cookie('shoppingCartID', shoppingCartID, {
                        maxAge: 3600000 * 24, // 24 hours expiration
                        // httpOnly: true // Only accessible via HTTP(S
                    })
                    console.log('User is already logged in')
                    return res.json({ message: 'User is already logged in', token, userID });
                }
            }


        }

        // Validate username and password for new login attempt
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }


        const findUser = await findUserByUsername(username);

        if (findUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = findUser[0];

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (typeof user.password !== 'string') {
            console.error('Invalid password format in database:', user.password);
            throw new Error('Invalid password format in database');
        }

        // Ensure the plain password is a string
        if (typeof password !== 'string') {
            console.error('Invalid password format from request:', password);
            throw new Error('Invalid password format from request');
        }

        // Compare the plaintext password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set cookie if rememberMe is checked
        if (rememberMe) {
            console.log('Setting cookie for user: ', user.id);
            res.cookie('userID', user.id, {
                maxAge: 3600000 * 24, // 24 hours expiration
                // httpOnly: true // Only accessible via HTTP(S)

            });
        }

        const shoppingCartData = await getShoppingCartById(user.id)
        const shoppingCartID = shoppingCartData[0].id
        console.log("shoppingCartID: ", shoppingCartID)
        res.cookie('shoppingCartID', shoppingCartID, {
            maxAge: 3600000 * 24, // 24 hours expiration
            // httpOnly: true // Only accessible via HTTP(S)

        })

        res.json({ message: 'Login successful', token });

    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ message: 'Error logging in', error: error.message });
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