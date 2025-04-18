const { response } = require("express");
const pool = require("../db/db.js");

const createPedido = async (req, res) => {
    const data = req.body;
    try {
        await pool.query("BEGIN");
        const pedidoQuery = `
            INSERT INTO pedido 
            (order_date, order_observations, order_finish_date, order_status, dealer_id, order_base_price, order_iva_price, order_iva_value, enterprise_id, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *;
        `;
        const pedidoValues = [
            data.fecha_pedido,
            data.observacion_pedido,
            data.fecha_pedido_finalizacion,
            data.estado_pedido,
            data.dealer,
            data.precio_base_pedido,
            data.precio_iva_pedido,
            data.valor_iva_pedido,
            data.id_local,
            data.id_usuario
        ];

        const pedidoResult = await pool.query(pedidoQuery, pedidoValues);
        const idPedido = pedidoResult.rows[0].id_pedido;

        const detalleQuery = `
            INSERT INTO detalle_pedido 
            (order_detail_prod_cant, order_detail_base_price, order_detail_iva_price, order_detail_iva_value, product_id, order_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;

        for (const item of data.detalle) {
            const stockCheckQuery = "SELECT stock FROM productos WHERE id_producto = $1;";
            const stockCheckResult = await pool.query(stockCheckQuery, [item.idProducto]);

            if (stockCheckResult.rows.length === 0) {
                throw new Error(`Producto con ID ${item.idProducto} no encontrado.`);
            }

            const stockDisponible = stockCheckResult.rows[0].stock;

            if (item.cantidad > stockDisponible) {
                throw new Error(`Stock insuficiente para el producto con ID ${item.idProducto}.`);
            }

            const detalleValues = [
                idPedido,
                item.idProducto,
                item.cantidad,
                item.valorUnitario,
                item.subTotal,
                item.valorIva
            ];
            await pool.query(detalleQuery, detalleValues);

            // Se Reduce el stock del producto.
            const updateStockQuery = `
                UPDATE productos 
                SET stock = stock - $1 
                WHERE id_producto = $2;
            `;
            await pool.query(updateStockQuery, [item.cantidad, item.idProducto]);
        }

        // Confirmar la transacción.
        await pool.query("COMMIT");

        res.status(201).json({
            message: "Pedido creado con éxito",
            pedido: pedidoResult.rows[0],
            response: true
        });
    } catch (error) {
        //await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({
            message: "Error al crear el pedido",
            error: error.message,
            response: false
        });
    }
};

const getDetallesByPedidoId = async (req, res) => {
    const idPedido = req.params.idPedido;

    try {
        const query = `
            SELECT 
                dp.id_detalle,
                dp.id_pedido,
                dp.id_producto,
                p.nombre AS nombre_producto,
                dp.cantidad,
                dp.valor_unitario,
                dp.subTotal,
                dp.valor_iva
            FROM detalle_pedido dp
            INNER JOIN productos p ON dp.id_producto = p.id_producto
            WHERE dp.id_pedido = $1;
        `;

        const { rows } = await pool.query(query, [idPedido]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: `No se encontraron detalles para el pedido con ID ${idPedido}`
            });
        }

        res.status(200).json({
            message: "Detalles del pedido recuperados con éxito",
            detalles: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error al obtener los detalles del pedido",
            error: err.message
        });
    }
};
const updateTotalPedido = async (req, res) => {
    const { idPedido } = req.params;
    const data = req.body;
    try {

        const queryUpdate = `
            UPDATE pedido
            SET total = $1
            WHERE id_pedido = $2
            RETURNING *;
        `;
        const { rows } = await pool.query(queryUpdate, [data.total, idPedido]);

        res.status(200).json({
            message: "Total del pedido actualizado con éxito",
            pedido: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error al actualizar el total del pedido",
            error: err.message
        });
    }
};
const getAllOrder = async (req, res) => {

    try {
        const query = "SELECT * FROM pedido;";
;

        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "No se encontraron pedidos.",
                rta: false
            });
        }

        res.status(200).json({
            msg: "Pedidos obtenidos con éxito",
            data: rows,
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener los pedidos: "+err.message,
            rta: false
        });
    }
};
const getPedidoById = async (req, res) => {
    const { idPedido } = req.params;

    try {
        const query = `
            SELECT * FROM pedido WHERE order_id= $1;
        `;

        const values = [idPedido];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "No se encontraron pedidos.",
                rta: false
            });
        }

        res.status(200).json({
            msg: "Pedidos obtenidos con éxito",
            data: pedidos[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener los pedidos: "+err.message,
            rta: false
        });
    }
};

const getPedidoBEstadoAndUserId = async (req, res) => {
    const { estado, idUsuario } = req.params;

    try {
        const query = `
            SELECT 
                p.id_pedido,
                p.nombre_solicitante,
                p.cedula_solicitante,
                u.token_notific,
                p.telefono,
                p.descripcion,
                p.total,
                p.fecha_emision,
                p.latitud,
                p.longitud,
                dl.latitud AS latitud_licorera,
                dl.longitud AS longitud_licorera,
                p.direccion,
                p.estado,
                dp.id_detalle,
                dp.id_producto,
                dp.cantidad,
                dp.valor_unitario,
                dp.subTotal,
                dp.valor_iva,
                prod.nombre AS producto_nombre,
                prod.descripcion AS producto_descripcion,
                prod.precio_unitario AS producto_precio,
                lic.nombre AS licorera_nombre
            FROM 
                pedido p
            INNER JOIN 
                detalle_pedido dp ON p.id_pedido = dp.id_pedido
            INNER JOIN 
                productos prod ON dp.id_producto = prod.id_producto
            INNER JOIN 
                licorera lic ON prod.id_licorera = lic.id_licorera
            INNER JOIN
                direccion_licorera dl ON lic.id_licorera = dl.id_licorera
            INNER JOIN
                usuario u ON p.id_usuario = u.id_usuario
            WHERE 
                p.estado = $1 AND p.id_usuario = $2
            ORDER BY 
                p.fecha_emision DESC;
        `;

        const values = [estado, idUsuario];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No se encontraron pedidos con el estado y licorera especificados.",
                response: false
            });
        }

        const pedidos = rows.reduce((acc, row) => {
            const {
                id_pedido,
                nombre_solicitante,
                cedula_solicitante,
                token_notific,
                telefono,
                descripcion,
                total,
                fecha_emision,
                latitud,
                longitud,
                latitud_licorera,
                longitud_licorera,
                direccion,
                estado,
                id_detalle,
                id_producto,
                cantidad,
                valor_unitario,
                subTotal,
                valor_iva,
                producto_nombre,
                producto_descripcion,
                producto_precio,
                licorera_nombre,
            } = row;

            const pedidoIndex = acc.findIndex(p => p.id_pedido === id_pedido);

            const detalle = {
                id_detalle,
                id_producto,
                cantidad,
                valor_unitario,
                subTotal,
                valor_iva,
                producto_nombre,
                producto_descripcion,
                producto_precio,
            };

            if (pedidoIndex === -1) {
                acc.push({
                    id_pedido,
                    nombre_solicitante,
                    cedula_solicitante,
                    token_notific,
                    telefono,
                    descripcion,
                    total,
                    fecha_emision,
                    latitud,
                    longitud,
                    latitud_licorera,
                    longitud_licorera,
                    direccion,
                    estado,
                    licorera_nombre,
                    detalles: [detalle],
                });
            } else {
                acc[pedidoIndex].detalles.push(detalle);
            }

            return acc;
        }, []);

        res.status(200).json({
            message: "Pedidos obtenidos con éxito",
            pedidos,
            response: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error al obtener los pedidos",
            error: err.message,
            response: false
        });
    }
}

const updateEstadoPedido = async (req, res) => {
    const { idPedido } = req.params;
    const data = req.body;

    try {
        const query = `
            UPDATE pedido
            SET estado = $1
            WHERE id_pedido = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [data.estado, idPedido]);

        res.status(200).json({
            message: "Estado del pedido actualizado con éxito",
            pedido: rows[0],
            response: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error al actualizar el estado del pedido",
            error: err.message,
            response: false
        });
    }
}

module.exports = {
    createPedido,
    getDetallesByPedidoId,
    getPedidoById,
    getPedidoBEstadoAndUserId,
    updateTotalPedido,
    updateEstadoPedido
};