const express = require('express');

const { createMoto, getAllMotos, getMotosByUserId } = require("../controllers/motorcycle.controllers");

const router = express.Router();

router.get("/web/motorizados", getAllMotos);
router.get("/movil/motosUsuario/:user_id", getMotosByUserId);
router.post("/web/createMotorizado", createMoto);

module.exports = router;
