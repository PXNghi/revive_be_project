const Category = require("../models/category_model");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.log("Lỗi tại getAllCategories: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        return res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.log("Lỗi tại getCategoryById: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.log("Lỗi tại createCategory: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { $set: req.body }, { new: true });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        return res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.log("Lỗi tại updateCategory: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        return res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.log("Lỗi tại deleteCategory: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}



