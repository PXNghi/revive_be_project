const express = require('express');
const productController = require('../controllers/product_controller');

const router = express.Router();

router.get('/get-all-products', productController.getAllProducts);
router.get('/get-product-by-category/:categoryId', productController.getProductByCategoryId);
router.get('/get-product-by-id/:id', productController.getProductById);
router.post('/create-new-product', productController.createProduct);
router.put('/update-product/:id', productController.updateProductById);
router.delete('/delete-product/:id', productController.deleteProductById);

module.exports = router;