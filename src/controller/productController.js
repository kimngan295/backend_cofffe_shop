import { addProduct, getAllProducts, getProductById, getProductsInPage } from "../models/productModel.js"

export const getProducts = async (req, res) => {
    try {
        // Extract pagination parameters from query string
        const { page = 1, perPage = 10 } = req.query;
        const currentPage = parseInt(page);
        const itemsPerPage = parseInt(perPage);

        const products = await getProductsInPage(currentPage, itemsPerPage);
        const total = await getAllProducts();
        if (total.length === 0) {
            return res.status(404).json({ message: "No all products found" });
        }
        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        
        return res.status(200).json({ message: "Product found",total_product: total, products: products });
    } catch (error) {
        res.status(500).json({ message: "Error getting products", error });
    }
}

export const getProductDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await getProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product found", product: product });
    } catch (error) {
        res.status(500).json({ message: "Error getting product", error });
    }
}

export const createNewProduct = async (req, res) => {
    const { name, description, price, quantity_stock, origin, packaging, rate, img_url } = req.body;
    try {
        const data = {
            name: name,
            description: description,
            price: price,
            quantity_stock: quantity_stock,
            origin: origin,
            packaging: packaging,
            rate: rate,
            img_url: img_url
        }

        const newProduct = await addProduct(data)
        if(newProduct){
            return res.status(201).json({ message: "Product created successfully", product: newProduct });
        }
    } catch (error) {
        res.status(500).json({ message: "Error creating new product", error});
    }
}