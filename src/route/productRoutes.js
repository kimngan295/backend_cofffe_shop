import express from 'express';
import { getProducts, getProductDetails, createNewProduct } from '../controller/productController.js';

const router = express.Router();

router.get('/getAllProducts', getProducts)
router.get('/getProductDetails/:id', getProductDetails)
router.post('/addProduct', createNewProduct)

export default router;