const express = require('express');

const { createEnterprise, deleteEnterprise, getEnterprise, getEnterpriseCategory, updateEnterprise, getEnterpriseById } = require("../controllers/enterprise.controllers");

const router = express.Router();

router.get("/web/empresas", getEnterprise);
router.post("/web/createEmpresa", createEnterprise);
router.put("/web/updateEmpresa/:idEmpresa", updateEnterprise);
router.delete("/web/deleteEmpresa/:id", deleteEnterprise);
router.get("/movil/empresasCategoria/:categoria_id", getEnterpriseCategory);
router.get("/web/empresa/:empresa_id", getEnterpriseById);

module.exports = router;