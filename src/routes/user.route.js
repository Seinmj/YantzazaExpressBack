const express = require('express');

const { login, register,updateUser, updateUserContrasenia, updateUserToken,getUserByCI,getUserById,UpdateUserStatus} = require("../controllers/user.controllers");

const router = express.Router();

router.post("movil/Registro", register);
router.post("movil/login", login);
router.put("movil/actualizarUsuario/:idUsuario", updateUser);
router.put("movil/actualizarUsuarioToken/:idUsuario", updateUserToken);
router.put("movil/actualizarUsuarioContrasenia/:idUsuario", updateUserContrasenia);
router.get("movil/obtenerUsuarioID/:idUsuario", getUserById);
router.get("movil/obtenerUsuarioCI/:cedula", getUserByCI);

router.put("web/actualizarEstadoMoto/:idUsuario", UpdateUserStatus);
module.exports = router;