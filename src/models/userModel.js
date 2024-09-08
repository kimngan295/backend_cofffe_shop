import supabase from '../config/connectDB.js';
import bcrypt from 'bcrypt'

export async function addUser(newUser) {
    try {
        const { data: user, error } = await supabase
            .from('user')
            .insert([newUser])
            .select()

        if (error) {
            throw error;
        }

        // Check if user data is present and has an 'id'
        if (!user || !user.length || !user[0].id) {
            throw new Error('Failed to insert user or retrieve user ID');
        }

        const userID = user[0].id; // Assuming user[0].id is available after insertion

        // Insert shopping cart for the user
        const { data: shopping_cart, error: errAddCart } = await supabase
            .from('shopping_cart')
            .insert([{ user_id: userID }])
            .select()

        if (errAddCart) {
            throw errAddCart;
        }
        console.log(user)
        // Return the newly registered user and shopping cart data
        return { user: user, shopping_cart };
    } catch (error) {
        console.error("Error adding user:", error.message);
        throw error;
    }
}

export async function findUserByUsername(username) {
    try {
        const { data: user, error } = await supabase
            .from('user')
            .select()
            .eq('username', username)

        if (error) {
            throw error;
        }

        if (!user) {
            return null; // No user found
        }
        return user;
    } catch (error) {
        console.error("Error finding user by username:", error.message);
        throw error;
    }
}

export async function updateUserPassword(username, newPassword) {
    try {

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const { data, error } = await supabase
            .from('user')
            .update({ password: hashedPassword })
            .eq('username', username)
            .select()
        if (error) {
            throw error;
        }
        if (!data || data.length === 0) {
            throw new Error('Failed to update password');
        }
        console.log(data)
        return data
    } catch (error) {
        console.error("Error updating user password:", error.message);
        throw error;
    }
}

// get user by userID
export async function getUserByUserID(userID) {
    try {
        const {data, error} = await supabase
        .from("user")
        .select()
        .eq("id", userID)

        if(error){
            throw error
        }

        return data
    } catch (error) {
        console.log("Error getting user", error.message)
        throw error
    }
}