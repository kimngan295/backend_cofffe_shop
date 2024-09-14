import express from 'express';
import { createNewProductToCartItems, deleteProductFromCartItems, getProductInShoppingCart } from '../controller/shoppingCartController.js';
import authenticate from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/shopping-cart', authenticate, getProductInShoppingCart)
// router.post('/shopping-cart', getShoppingCart)
router.post('/addProductToCartItems', authenticate, createNewProductToCartItems)
router.post('/deleteProductFromCartItems/:productID', authenticate, deleteProductFromCartItems)

export default router;