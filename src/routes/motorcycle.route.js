const express = require('express');

const { createMoto,getAllMotos } = require("../controllers/motorcycle.controllers");

const router = express.Router();

router.get("/web/motorizados", getAllMotos);
router.post("/web/createMotorizado", createMoto);

module.exports = router;
