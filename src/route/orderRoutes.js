import express from 'express';
import { createNewProductToCartItems, deleteProductFromCartItems, getShoppingCart } from '../controller/orderController.js';

const router = express.Router();

router.post('/shopping-cart/:shoppingCartID', getShoppingCart)
// router.post('/shopping-cart', getShoppingCart)
router.post('/addProductToCartItems', createNewProductToCartItems)
router.post('/deleteProductFromCartItems/:productID', deleteProductFromCartItems)

export default router;