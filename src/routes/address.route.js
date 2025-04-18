const express = require('express');

const {createUserAddress,getUserAddress,updateAddress } = require("../controllers/address.controllers");

const router = express.Router();

router.get("movil/direcciones/:idUsuario", getUserAddress);
router.put("movil/updateDireccion/:idDireccion", updateAddress);
router.post("movil/createDireccion", createUserAddress);

module.exports = router;