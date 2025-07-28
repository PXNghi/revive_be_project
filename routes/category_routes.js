const express = require("express");
const categoryController = require("../controllers/category_controller");

const router = express.Router();

router.get("/get-all-categories", categoryController.getAllCategories);
router.get("/get-category-by-id/:id", categoryController.getCategoryById);
router.post("/create-new-category", categoryController.createCategory);
router.put("/update-category/:id", categoryController.updateCategory);
router.delete("/delete-category/:id", categoryController.deleteCategory);

module.exports = router;