import supabase from '../config/connectDB.js'

export async function getAllProducts() {
    try {
        const { data: all_product, err } = await supabase
            .from('product')
            .select()
        if (err) {
            throw err
        }
        if (all_product.length === 0) {
            throw new Error('No products')
        }
        const totalProducts = all_product.length
        return totalProducts
    } catch (error) {
        console.error("Error getting all products" + error.message)
    }
}

export async function getProductsInPage(currentPage, itemsPerPage) {
    try {

        const { data, error } = await supabase
            .from('product')
            .select()
            .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }
        if (data.length === 0) {
            throw new Error('No products')
        }
        return data
    } catch (error) {
        console.error("Error getting all products:", error.message);
        throw error
    }
}

export async function getProductById(id) {
    try {
        const { data, error } = await supabase
            .from('product')
            .select()
            .eq('id', id);

        if (error) {
            throw error
        }
        return data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

// add new product
export async function addProduct(product) {
    try {
        const { data, error } = await supabase
            .from('product')
            .insert([product])
            .select()

        if (error) {
            throw error
        }
        return data
    } catch (error) {
        console.error("Error adding product:", error.message);
        throw error;
    }
}