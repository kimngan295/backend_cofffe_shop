import { addProductToCartItems, checkProductBeforeAdd, deleteProduct, getAllProductInShoppingCart, getShoppingCartById, updateProduct } from "../models/shoppingCartModel.js";
import { getProductById } from "../models/productModel.js";
import sendResponse from "../utils/responseHelper.js";

export const getShoppingCart = async (req, res) => {
    try {
        console.log(req.user)
        const userId = req.user.userID; // Lấy user_id từ JWT
        const cart = await getShoppingCartById(userId);

        if (!cart || cart.length === 0) {
            throw new Error("Shopping cart not found");
        }

        const shoppingCartId = cart[0].id;
        // sendResponse(res, 'success', 'Get Shopping Cart successfully', { cart });

        return shoppingCartId; // Trả về shoppingCartId để sử dụng tiếp
    } catch (error) {
        console.error("Error fetching shopping cart", error.message);
        sendResponse(res, 'error', error.message, null, { code: 500 })
    }
}


//get products in shopping cart
export const getProductInShoppingCart = async (req, res) => {
    try {
        const shoppingCartId = await getShoppingCart(req, res);

        if (!shoppingCartId) {
            return sendResponse(res, 'error', 'No shopping cart ID provided', null, { code: 400 })
        }

        // Truy vấn các sản phẩm trong giỏ hàng theo shoppingCartId
        const carts = await getAllProductInShoppingCart(shoppingCartId);

        if (carts.length === 0) {
            return sendResponse(res, 'success', 'No products found in shopping cart', null)
        }

        return sendResponse(res, 'success', 'Carts Found', { carts })

    } catch (error) {
        return sendResponse(res, 'error', error.message, null, { code: 500 })
    }
}

// add product to shopping cart
export const createNewProductToCartItems = async (req, res) => {
    try {
        const { quantity, productID } = req.body; // Nhận productID và quantity từ body

        if (!quantity || !productID) {
            return sendResponse(res, 'error', 'ProductID and quantity are required', null, { code: 400 });
        }

        // Lấy shoppingCartID từ token hoặc session thông qua hàm getShoppingCart
        const shoppingCartID = await getShoppingCart(req, res);

        if (!shoppingCartID) {
            return sendResponse(res, 'error', 'No shopping cart ID found', null, { code: 400 });
        }

        console.log('quantity:', quantity, 'productID:', productID, 'shoppingCartID:', shoppingCartID);

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const productExists = await checkProductBeforeAdd(productID, shoppingCartID);
        const existingProduct = productExists[0];

        // Lấy thông tin sản phẩm từ productID
        const getProduct = await getProductById(productID);
        const productData = getProduct[0];
        const productPrice = productData.price;

        console.log('Product Price:', productPrice);

        // Nếu sản phẩm đã có trong giỏ hàng
        if (existingProduct) {
            console.log("Product already exists in cart");
            const updatedQuantity = existingProduct.quantity + quantity;
            const updatedPrice = existingProduct.price + productPrice * quantity;

            const data = {
                quantity: updatedQuantity,
                price: updatedPrice,
            };

            const updatedProduct = await updateProduct(data, productID, shoppingCartID);

            // Gửi phản hồi sau khi cập nhật sản phẩm
            if (updatedProduct) {
                return sendResponse(res, 'success', 'Product updated successfully', { product: updatedProduct });
            } else {
                return sendResponse(res, 'error', 'Failed to update product in cart', null, { code: 500 });
            }
        } else {
            // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
            const newProductData = {
                name: productData.name,
                quantity: quantity,
                price: productPrice * quantity,
                product_id: productID,
                shopping_cart_id: shoppingCartID
            };

            const addedProduct = await addProductToCartItems(newProductData);

            // Gửi phản hồi sau khi thêm sản phẩm
            if (addedProduct) {
                return sendResponse(res, 'success', 'Product added successfully', { product: addedProduct });
            } else {
                return sendResponse(res, 'error', 'Failed to add product to cart', null, { code: 500 });
            }
        }

    } catch (error) {
        // Gửi phản hồi lỗi nếu có lỗi xảy ra
        console.log("Error adding product to shopping cart:", error.message);
        return sendResponse(res, 'error', 'Error adding product to shopping cart', null, { code: 500 });
    }
};



export const deleteProductFromCartItems = async (req, res) => {
    try {
        const { productID } = req.params;
        const shoppingCartID = await getShoppingCart(req, res);

        if (!shoppingCartID) {
            // Gửi phản hồi lỗi nếu không tìm thấy shoppingCartID
            return sendResponse(res, 'error', 'Shopping cart not found', null, { code: 404 });
        }

        const deletedProduct = await deleteProduct(productID, shoppingCartID);

        if (!deletedProduct) {
            // Gửi phản hồi lỗi nếu không tìm thấy sản phẩm
            return sendResponse(res, 'error', 'Product not found in cart', null, { code: 404 });
        }

        // Gửi phản hồi thành công
        return sendResponse(res, 'success', 'Product deleted successfully', { product: deletedProduct });

    } catch (error) {
        // Gửi phản hồi lỗi nếu có lỗi xảy ra
        console.error("Error deleting product from cart:", error.message);
        return sendResponse(res, 'error', 'Error deleting product from cart', null, { code: 500 });
    }
}