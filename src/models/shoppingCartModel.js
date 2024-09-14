import supabase from '../config/connectDB.js'

// get shopping cart bu ID
export async function getShoppingCartById(userID) {
    try {
        const {data, error} = await supabase
        .from("shopping_cart")
        .select()
        .eq("user_id", userID)

        if(error){
            throw error
        }

        return data
    } catch (error) {
        console.error("Error getting shopping cart by ID", error.message)
        throw error
    }
}
// load data into shoppping cart
export async function getAllProductInShoppingCart(shoppingCartID) {
    try {
        const { data, error } = await supabase
            .from("cart_items")
            .select("name, quantity, price")
            .eq("shopping_cart_id", shoppingCartID)

            if(error){
                throw error;
            }

            return data
    } catch (error) {
        console.error("Error find product in shopping cart", error)
        throw error;
    }
}

// check product before adding to shopping cart

export async function checkProductBeforeAdd(productID, shoppingCartID) {
    try {
        const { data, error } = await supabase
            .from("cart_items")
            .select()
            .eq("shopping_cart_id", shoppingCartID)
            .eq("product_id", productID)

        if (error) {
            throw error
        }

        return data
    } catch (error) {
        console.error("Error check product before add to shopping cart", error)
        throw error;
    }
}

// add products to cart_items
export async function addProductToCartItems(data) {
    try {
        const { data: cart_items, error: errAddCart } = await supabase
            .from("cart_items")
            .insert([data])
            .select()

        if (errAddCart) {
            throw errAddCart
        }

        return cart_items
    } catch (error) {
        console.error("Error add product to shopping cart", error)
        throw error;
    }
}

// update quantity of product in cart_items
export async function updateProduct(newdata, productID, shoppingCartID) {
    try {
        const { data, error } = await supabase
            .from("cart_items")
            .update([newdata])
            .eq("product_id", productID)
            .eq("shopping_cart_id", shoppingCartID)
            .select()

        if (error) {
            throw error
        }

        return data
    } catch (error) {
        console.error("Error update product quantity", error)
    }
}

// delete product from cart_items
export async function deleteProduct(productID, shoppingCartID) {
    try {
        const { data, error } = await supabase
            .from("cart_items")
            .delete()
            .eq("product_id", productID)
            .eq("shopping_cart_id", shoppingCartID)
            .select()

        if (error) {
            throw error
        }
        console.log(data)
        return data
    } catch (error) {
        console.error("Error delete product from shopping cart", error)
    }
}