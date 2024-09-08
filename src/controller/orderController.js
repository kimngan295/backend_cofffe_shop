import { addProductToCartItems, checkProductBeforeAdd, deleteProduct, getAllProductInShoppingCart, updateProduct } from "../models/orderModel.js";
import { getProductById } from "../models/productModel.js";

// get shopping cart
export const getShoppingCart = async (req, res) => {
    // const shoppingCartID = 11

    const { shoppingCartID } = req.params;
    // const shoppingCartID = req.cookies.shoppingCartID;

    console.log('shopping cart id cookie: ' + shoppingCartID)

    try {
        if (!shoppingCartID) {
            return res.status(400).json({ message: "No shopping cart ID provided" });
        }
        const carts = await getAllProductInShoppingCart(shoppingCartID);

        if (carts.length === 0) {
            return res.status(404).json({ message: "No cart found" })
        }
        return res.status(200).json({ message: "Cart found", carts: carts })
    } catch (error) {
        res.status(500).json({ message: "Error getting shopping cart", error: error.message });
    }

}

// add product to shopping cart
export const createNewProductToCartItems = async (req, res) => {
    try {
        const { quantity, productID, shoppingCartID } = req.body;

        console.log('quantity: ' + quantity, 'productID: ' + productID, 'shoppingCartID: ' + shoppingCartID)

        const productExists = await checkProductBeforeAdd(productID, shoppingCartID)
        const getData = productExists[0]

        const getProduct = await getProductById(productID)
        const dataProduct = getProduct[0]
        const priceProduct = dataProduct.price
        console.log(priceProduct)

        if (productExists.length > 0) {
            console.log("Product already exists")
            const newQuantity = getData.quantity + quantity
            const newPrice = getData.price + priceProduct * quantity

            const data = {
                quantity: newQuantity,
                price: newPrice,
            }

            const updatedQuantity = await updateProduct(data, productID, shoppingCartID)

            if (updatedQuantity) {
                return res.status(200).json({ message: "Product updated successfully", newProduct: updatedQuantity })
            }
        } else {
            const data = {
                name: dataProduct.name,
                quantity: quantity,
                price: priceProduct * quantity,
                product_id: productID,
                shopping_cart_id: shoppingCartID
            }

            const productInCartItems = await addProductToCartItems(data)
            if (productInCartItems) {
                return res.status(200).json({ message: "Product added successfully", newProduct: productInCartItems })
            }
        }


    } catch (error) {
        console.log("Error adding product to shopping cart" + error.message)
        return res.status(500).json({ message: "Error adding product to shopping cart", error });
    }
}

export const deleteProductFromCartItems = async (req, res) =>{
    try {
        const {productID} = req.params
        const shoppingCartID = req.cookies.shoppingCartID

        console.log(productID)
        console.log("shoppingCartId: " + shoppingCartID)

        const deletedProduct = await deleteProduct(productID, shoppingCartID)
        if(!deletedProduct){
            return res.status(404).json({ message: "Product not found in cart" })
        }
        return res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error deleting product from cart", error });
    }
}