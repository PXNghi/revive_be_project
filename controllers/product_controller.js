const Product = require("../models/product_model");

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category");
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log("Error in getAllProducts: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.getProductByCategoryId = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId }).populate("category");
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "Không có sản phẩm" });
        }
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log("Error in getProductByCategoryId: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.log("Error in getProductById: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, amount, category, image } = req.body;
        const newProduct = new Product({
            name,
            price,
            description,
            amount,
            category,
            image
        });
        await newProduct.save();
        return res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.log("Error in createProduct: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.updateProductById = async (req, res) => {
    try {
        const { name, price, description, amount, category, image } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { name, price, description, amount, category, image } },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }
        return res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.log("Error in updateProduct: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.deleteProductById = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }
        return res.status(200).json({ success: true, message: "Sản phẩm đã được xóa thành công" });
    } catch (error) {
        console.log("Error in deleteProduct: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}