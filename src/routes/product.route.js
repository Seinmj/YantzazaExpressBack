const express = require('express');

const {
    createProduct, deleteProduct, getProductCategory, updateProduct, getProductById, getProductosPorLocal
} = require('../controllers/product.controllers');

const router = express.Router();

router.post('/web/createProducto', createProduct);
router.get('/movil/productosCategoria/:idCategoria', getProductCategory);
router.put('/web/updateProducto/:idProducto', updateProduct);
router.delete('/web/deleteProducto/:idProducto', deleteProduct);
router.get('/movil/producto/:idProducto', getProductById);
router.get('/movil/productosLocal/', getProductosPorLocal);

module.exports = router;