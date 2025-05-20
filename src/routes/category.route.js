const express = require('express');

const { createCategory, createCategoryMaster, getCategory, getCategoryMaster, updateCategory, updateCategoryMaster } = require("../controllers/categoryMaster.controllers");

const router = express.Router();

router.get("/movil/categoriasMaster/", getCategoryMaster);
router.get("/web/categoriasMaster/", getCategoryMaster);
router.post("/web/createCategoriaMaster", createCategoryMaster);
router.get("/web/categorias/:empresa_id", getCategory);
router.post("/web/createCategoria", createCategory);
router.put("/web/updateCategoria/:categoria_id", updateCategory);
router.put("/web/updateCategoriaMaster/:categoria_id", updateCategoryMaster);

module.exports = router;