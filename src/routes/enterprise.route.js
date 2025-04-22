const express = require('express');

const { createEnterprise, deleteEnterprise, getEnterprise, getEnterpriseById, getEnterpriseCategory, updateEnterprise } = require("../controllers/enterprise.controllers");

const router = express.Router();

router.get("/movil/empresas", getEnterprise);
router.post("/web/createEmpresa", createEnterprise);
router.put("/web/updateEmpresa/:idEmpresa", updateEnterprise);
router.delete("/web/deleteEmpresa/:id", deleteEnterprise);
router.get("/movil/empresasCategoria/:categoria_id", getEnterpriseCategory);

module.exports = router;