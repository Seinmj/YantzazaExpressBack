const express = require('express');

const {createPedido,getPedidoById, updateEstadoPedido,getAllPedidos,getPedidoByMoto,getPedidoByMotoState,getPedidoByUserState,updateEstadoFechaPedido,updateEstadoMotoPedido}= require("../controllers/order.controllers");

const router = express.Router();

router.get('/web/pedido/:idPedido', getPedidoById);
router.get('/web/pedidos', getAllPedidos);
//router.get("/detallesPedido/:idPedido",getDetallesByPedidoId);
router.post("/movil/createPedido",createPedido);
router.get('/movil/pedidos/cliente', getPedidoByUserState);
router.get('/movil/pedidos/motorizado', getPedidoByMotoState);
router.put("/web/updateEstadoPedido/:idPedido", updateEstadoPedido);
router.put("/movil/updateEstadoMotorizado/:idPedido", updateEstadoMotoPedido);
router.put("/movil/updateEstadoFecha/:idPedido", updateEstadoFechaPedido);
router.get('/movil/pedidos/idMotorizado/:dealer_id', getPedidoByMoto);

module.exports = router;