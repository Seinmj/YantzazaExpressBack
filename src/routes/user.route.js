const express = require('express');

const { login, register, updateUser, updateUserContrasenia, updateUserToken, getUserByCI, getUserById, UpdateUserStatus, registerDealer, getDealers, updateDealer, getAllUsersByType } = require("../controllers/user.controllers");

const router = express.Router();

router.get("/web/obtenerUsuarios/:userType", getAllUsersByType);
router.post("/movil/Registro", register);
router.post("/web/Registro", register);
router.post("/movil/login", login);
router.put("/movil/actualizarUsuario/:idUsuario", updateUser);
router.put("/web/actualizarUsuario/:idUsuario", updateUser);
router.put("/movil/actualizarUsuarioToken/:idUsuario", updateUserToken);
router.put("/movil/actualizarUsuarioContrasenia/:idUsuario", updateUserContrasenia);
router.get("/movil/obtenerUsuarioID/:idUsuario", getUserById);
router.get("/web/obtenerUsuarioID/:idUsuario", getUserById);
router.get("/movil/obtenerUsuarioCI/:cedula", getUserByCI);
router.post("/web/RegistroMotorizado", registerDealer);
router.get("/web/obtenerMotorizados", getDealers);
router.put("/web/actualizarMotorizado/:idUsuario", updateDealer);


router.put("web/actualizarEstadoMoto/:idUsuario", UpdateUserStatus);
module.exports = router;