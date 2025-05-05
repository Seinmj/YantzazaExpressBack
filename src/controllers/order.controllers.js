const { response } = require("express");
const pool = require("../db/db.js");
const admin = require("../controllers/firebase.js");

const createPedido = async (req, res) => {
    const data = req.body;
    try {
        await pool.query("BEGIN");
        const pedidoQuery = `
            INSERT INTO pedido 
            (order_date, order_observations, order_init_date, order_finish_date, order_status, dealer_id, order_base_price, order_iva_price, order_iva_value, order_total, enterprise_id, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *;
        `;
        const pedidoValues = [
            data.fecha_pedido,
            data.observacion_pedido,
            data.fecha_pedido_inicializacion,
            data.fecha_pedido_finalizacion,
            data.estado_pedido,
            data.dealer,
            data.precio_base_pedido,
            data.precio_iva_pedido,
            data.valor_iva_pedido,
            data.valor_total,
            data.id_local,
            data.id_usuario
        ];

        const pedidoResult = await pool.query(pedidoQuery, pedidoValues);
        const idPedido = pedidoResult.rows[0].order_id;

        const detalleQuery = `
            INSERT INTO detalle_pedido 
            (order_detail_prod_cant, order_detail_base_price, order_detail_iva_price, order_detail_iva_value, product_id, order_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;

        for (const item of data.detalle) {
            const stockCheckQuery = "SELECT stock FROM producto WHERE product_id = $1;";
            const stockCheckResult = await pool.query(stockCheckQuery, [item.idProducto]);

            if (stockCheckResult.rows.length === 0) {
                //throw new Error(`Producto con ID ${item.idProducto} no encontrado.`);
                return res.status(201).json({
                    msg: `Producto con ID ${item.idProducto} no encontrado.`,
                    rta: false
                });
            }

            const stockDisponible = stockCheckResult.rows[0].stock;

            if (item.cantidad > stockDisponible) {
                // new Error(`Stock insuficiente para el producto con ID ${item.idProducto}.`);
                return res.status(201).json({
                    msg: `Stock insuficiente para el producto con ID ${item.idProducto}.`,
                    rta: false
                });
            }

            const detalleValues = [
                item.cantidad,
                item.precioBase,
                item.precioIVA,
                item.valorIVA,
                item.idProducto,
                idPedido
            ];
            await pool.query(detalleQuery, detalleValues);

            // Se Reduce el stock del producto.
            const updateStockQuery = `
                UPDATE producto 
                SET stock = stock - $1 
                WHERE product_id = $2;
            `;
            await pool.query(updateStockQuery, [item.cantidad, item.idProducto]);
        }

        // Confirmar la transacción.
        await pool.query("COMMIT");

        res.status(201).json({
            msg: "Pedido creado con éxito",
            data: pedidoResult.rows[0],
            rta: true
        });
    } catch (error) {
        //await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({
            msg: "Error al crear el pedido",
            data: error.message,
            rta: false
        });
    }
};
const getAllPedidos = async (req, res) => {

    try {
        const query = `
            SELECT 
            p.order_id,
            p.order_date,
            p.order_observations,
            p.order_init_date,
            p.order_finish_date,
            p.order_status,
            p.order_base_price,
            p.order_iva_price,
            p.order_iva_value,
            p.order_total, 

            e.enterprise_id,
            e.enterprise_name,
            e.enterprise_description, 

            u.user_id,
            u.first_names,
            u.last_names,
            u.email, 

            d.direction_id,
            d.latitude,
            d.longitude,
            d.principal_street,
            d.secondary_street,
            d.alias 

            FROM pedido p 
            INNER JOIN usuario u ON p.user_id = u.user_id 
            INNER JOIN local_empresa e ON p.enterprise_id = e.enterprise_id 
            LEFT JOIN direcciones_usuario d ON d.user_id = u.user_id 
        `;

        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "No se encontraron pedidos.",
                rta: false
            });
        }
        const pedidos = result.rows.map(row => ({
            orden_id: row.order_id,
            order_date: row.order_date,
            order_observations: row.order_observations,
            order_init_date: row.order_init_date,
            order_finish_date: row.order_finish_date,
            order_status: row.order_status,
            order_base_price: row.order_base_price,
            order_iva_price: row.order_iva_price,
            order_iva_value: row.order_iva_value,
            order_total: row.order_total,

            usuario: {
                user_id: row.user_id,
                first_names: row.first_names,
                last_names: row.last_names,
                email: row.email,
            },

            empresa: {
                enterprise_id: row.enterprise_id,
                enterprise_name: row.enterprise_name,
                enterprise_description: row.enterprise_description,
            },

            direccion: row.direction_id ? {
                direction_id: row.direction_id,
                latitude: row.latitude,
                longitude: row.longitude,
                principal_street: row.principal_street,
                secondary_street: row.secondary_street,
                alias: row.alias,
            } : null,
        }));
        res.status(200).json({
            msg: "Pedidos obtenidos con éxito",
            data: pedidos,
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener los pedidos: " + err.message,
            rta: false
        });
    }
};
const getPedidoById = async (req, res) => {
    const { idPedido } = req.params;

    try {
        const query = `
            SELECT 
            p.order_id,
            p.order_date,
            p.order_observations,
            p.order_init_date,
            p.order_finish_date,
            p.order_status,
            p.order_base_price,
            p.order_iva_price,
            p.order_iva_value,
            p.order_total,

            e.enterprise_id,
            e.enterprise_name,
            e.enterprise_description, 

            u.user_id, 
            u.first_names,
            u.last_names,
            u.email,

            d.direction_id,
            d.latitude,
            d.longitude,
            d.principal_street,
            d.secondary_street,
            d.alias 

            FROM pedido p 
            INNER JOIN usuario u ON p.user_id = u.user_id 
            INNER JOIN local_empresa e ON p.enterprise_id = e.enterprise_id 
            LEFT JOIN direcciones_usuario d ON d.user_id = u.user_id 
            WHERE p.order_id = $1
        `;

        const values = [idPedido];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "No se encontraron pedidos.",
                rta: false
            });
        }

        const row = rows[0];

        const pedido = {
            orden_id: row.order_id,
            order_date: row.order_date,
            order_observations: row.order_observations,
            order_init_date: row.order_init_date,
            order_finish_date: row.order_finish_date,
            order_status: row.order_status,
            order_base_price: row.order_base_price,
            order_iva_price: row.order_iva_price,
            order_iva_value: row.order_iva_value,
            order_total: row.order_total,

            usuario: {
                user_id: row.user_id,
                first_names: row.first_names,
                last_names: row.last_names,
                email: row.email,
            },

            empresa: {
                enterprise_id: row.enterprise_id,
                enterprise_name: row.enterprise_name,
                enterprise_description: row.enterprise_description,
            },

            direccion: row.direction_id ? {
                direction_id: row.direction_id,
                latitude: row.latitude,
                longitude: row.longitude,
                principal_street: row.principal_street,
                secondary_street: row.secondary_street,
                alias: row.alias,
            } : null,
        };

        res.status(200).json({
            msg: "Pedido obtenido con éxito",
            data: pedido,
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener el pedido: " + err.message,
            rta: false
        });
    }
};
const getPedidoByUserState = async (req, res) => {
    const { user_id, order_status } = req.query;
    try {
        const query = `
            SELECT 
            p.order_id,
            p.order_date,
            p.order_observations,
            p.order_init_date,
            p.order_finish_date,
            p.order_status,
            p.order_base_price,
            p.order_iva_price,
            p.order_iva_value,
            p.order_total,

            c.user_id AS cliente_id,
            c.first_names AS cliente_nombres,
            c.last_names AS cliente_apellidos,
            c.email AS cliente_email, 

            dir.direction_id,
            dir.latitude,
            dir.longitude,
            dir.principal_street,
            dir.secondary_street,
            dir.address_alias,
            dir.reference, 

            e.enterprise_id,
            e.enterprise_name,
            e.enterprise_description, 

            d.user_id AS dealer_id,
            d.first_names AS dealer_nombres,
            d.last_names AS dealer_apellidos,
            d.email AS dealer_email, 

            m.moto_id,
            m.moto_color,
            m.moto_placa,
            m.moto_year

            FROM pedido p 
            INNER JOIN usuario c ON p.user_id = c.user_id
            LEFT JOIN direcciones_usuario dir ON dir.user_id = c.user_id 
            INNER JOIN local_empresa e ON p.enterprise_id = e.enterprise_id 
            LEFT JOIN usuario d ON p.dealer_id = d.user_id 
            LEFT JOIN motocicleta m ON m.user_id = d.user_id 
            WHERE p.user_id = $1 AND p.order_status = $2 
            `;

        const values = [user_id, order_status];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "No se encontraron pedidos.",
                rta: false
            });
        }

        const row = rows[0];

        const pedidos = rows.map((row) => {
            return ({
                orden_id: row.order_id,
                order_date: row.order_date,
                order_observations: row.order_observations,
                order_init_date: row.order_init_date,
                order_finish_date: row.order_finish_date,
                order_status: row.order_status,
                order_base_price: row.order_base_price,
                order_iva_price: row.order_iva_price,
                order_iva_value: row.order_iva_value,
                order_total: row.order_total,

                usuario: {
                    user_id: row.cliente_id,
                    first_names: row.cliente_nombres,
                    last_names: row.cliente_apellidos,
                    email: row.cliente_email
                },

                direccion: row.direction_id ? {
                    direction_id: row.direction_id,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    principal_street: row.principal_street,
                    secondary_street: row.secondary_street,
                    alias: row.alias,
                    reference: row.reference
                } : null,

                empresa: {
                    enterprise_id: row.enterprise_id,
                    enterprise_name: row.enterprise_name,
                    enterprise_description: row.enterprise_description
                },

                dealer: row.dealer_id ? {
                    user_id: row.dealer_id,
                    first_names: row.dealer_nombres,
                    last_names: row.dealer_apellidos,
                    email: row.dealer_email,
                    motocicleta: row.moto_id ? {
                        moto_id: row.moto_id,
                        moto_color: row.moto_color,
                        moto_placa: row.moto_placa,
                        moto_year: row.moto_year
                    } : null
                } : null
            });
        });

        res.status(200).json({
            msg: "Pedidos obtenidos con éxito",
            data: pedidos,
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener los pedidos: " + err.message,
            rta: false
        });
    }
};
const getPedidoByMotoState = async (req, res) => {
    const { dealer_id, order_status } = req.query;
    try {
        const query = `
        SELECT 
        p.order_id,
        p.order_date,
        p.order_observations,
        p.order_init_date,
        p.order_finish_date,
        p.order_status,
        p.order_base_price,
        p.order_iva_price,
        p.order_iva_value,
        p.order_total,

        c.user_id AS cliente_id,
        c.first_names AS cliente_nombres,
        c.last_names AS cliente_apellidos,
        c.email AS cliente_email, 

        dir.direction_id,
        dir.latitude,
        dir.longitude,
        dir.principal_street,
        dir.secondary_street,
        dir.alias, 

        e.enterprise_id,
        e.enterprise_name,
        e.enterprise_description, 

        d.user_id AS dealer_id,
        d.first_names AS dealer_nombres,
        d.last_names AS dealer_apellidos,
        d.email AS dealer_email, 

        m.moto_id,
        m.moto_color,
        m.moto_placa,
        m.moto_year 

        FROM pedido p 
        INNER JOIN usuario c ON p.user_id = c.user_id 
        LEFT JOIN direcciones_usuario dir ON dir.user_id = c.user_id 
        INNER JOIN local_empresa e ON p.enterprise_id = e.enterprise_id 
        LEFT JOIN usuario d ON p.dealer_id = d.user_id 
        LEFT JOIN motocicleta m ON m.user_id = d.user_id 
        WHERE p.dealer_id = $1 AND p.order_status = $2
        `;

        const values = [dealer_id, order_status];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "No se encontraron pedidos.",
                data: [],
                rta: false
            });
        }

        const row = rows[0];

        const pedidos = rows.map(row => ({
            orden_id: row.order_id,
            order_date: row.order_date,
            order_observations: row.order_observations,
            order_init_date: row.order_init_date,
            order_finish_date: row.order_finish_date,
            order_status: row.order_status,
            order_base_price: row.order_base_price,
            order_iva_price: row.order_iva_price,
            order_iva_value: row.order_iva_value,
            order_total: row.order_total,

            usuario: {
                user_id: row.cliente_id,
                first_names: row.cliente_nombres,
                last_names: row.cliente_apellidos,
                email: row.cliente_email
            },

            direccion: row.direction_id ? {
                direction_id: row.direction_id,
                latitude: row.latitude,
                longitude: row.longitude,
                principal_street: row.principal_street,
                secondary_street: row.secondary_street,
                alias: row.alias
            } : null,

            empresa: {
                enterprise_id: row.enterprise_id,
                enterprise_name: row.enterprise_name,
                enterprise_description: row.enterprise_description
            },

            dealer: row.dealer_id ? {
                user_id: row.dealer_id,
                first_names: row.dealer_nombres,
                last_names: row.dealer_apellidos,
                email: row.dealer_email,
                motocicleta: row.moto_id ? {
                    moto_id: row.moto_id,
                    moto_color: row.moto_color,
                    moto_placa: row.moto_placa,
                    moto_year: row.moto_year
                } : null
            } : null
        }));

        res.status(200).json({
            msg: "Pedidos obtenidos con éxito",
            data: pedidos,
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener los pedidos: " + err.message,
            rta: false
        });
    }
};
const getPedidoByMoto = async (req, res) => {
    const { dealer_id } = req.query;
    try {
        const query = `
        SELECT 
        p.order_id,
        p.order_date,
        p.order_observations,
        p.order_init_date,
        p.order_finish_date,
        p.order_status,
        p.order_base_price,
        p.order_iva_price,
        p.order_iva_value,
        p.order_total, 

        c.user_id AS cliente_id,
        c.first_names AS cliente_nombres,
        c.last_names AS cliente_apellidos,
        c.email AS cliente_email, 

        dir.direction_id,
        dir.latitude,
        dir.longitude,
        dir.principal_street,
        dir.secondary_street,
        dir.alias, 

        e.enterprise_id,
        e.enterprise_name,
        e.enterprise_description, 

        d.user_id AS dealer_id,
        d.first_names AS dealer_nombres,
        d.last_names AS dealer_apellidos,
        d.email AS dealer_email, 

        m.moto_id,
        m.moto_color,
        m.moto_placa,
        m.moto_year 

        FROM pedido p 
        INNER JOIN usuario c ON p.user_id = c.user_id 
        LEFT JOIN direcciones_usuario dir ON dir.user_id = c.user_id 
        INNER JOIN local_empresa e ON p.enterprise_id = e.enterprise_id 
        LEFT JOIN usuario d ON p.dealer_id = d.user_id 
        LEFT JOIN motocicleta m ON m.user_id = d.user_id 
        WHERE p.dealer_id = $1 
        `;

        const values = [dealer_id];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "No se encontraron pedidos.",
                rta: false
            });
        }

        const row = rows[0];

        const pedidos = rows.map(row => ({
            orden_id: row.order_id,
            order_date: row.order_date,
            order_observations: row.order_observations,
            order_init_date: row.order_init_date,
            order_finish_date: row.order_finish_date,
            order_status: row.order_status,
            order_base_price: row.order_base_price,
            order_iva_price: row.order_iva_price,
            order_iva_value: row.order_iva_value,
            order_total: row.order_total,

            usuario: {
                user_id: row.cliente_id,
                first_names: row.cliente_nombres,
                last_names: row.cliente_apellidos,
                email: row.cliente_email
            },

            direccion: row.direction_id ? {
                direction_id: row.direction_id,
                latitude: row.latitude,
                longitude: row.longitude,
                principal_street: row.principal_street,
                secondary_street: row.secondary_street,
                alias: row.alias
            } : null,

            empresa: {
                enterprise_id: row.enterprise_id,
                enterprise_name: row.enterprise_name,
                enterprise_description: row.enterprise_description
            },

            dealer: row.dealer_id ? {
                user_id: row.dealer_id,
                first_names: row.dealer_nombres,
                last_names: row.dealer_apellidos,
                email: row.dealer_email,
                motocicleta: row.moto_id ? {
                    moto_id: row.moto_id,
                    moto_color: row.moto_color,
                    moto_placa: row.moto_placa,
                    moto_year: row.moto_year
                } : null
            } : null
        }));

        res.status(200).json({
            msg: "Pedidos obtenidos con éxito",
            data: pedidos,
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener los pedidos: " + err.message,
            rta: false
        });
    }
};
const updateEstadoPedido = async (req, res) => {
    const { idPedido } = req.params;
    const data = req.body;

    try {
        const query = `
            UPDATE pedido 
            SET order_status = $1 
            WHERE order_id = $2 
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [data.estado, idPedido]);

        // Cuando se actualiza el estado del pedido, enviar notificacion al cliente con ayuda de firebase messaging
        const message = {
            token: data.tokenCliente,
            notification: {
                title: "Estado del pedido actualizado",
                body: `El estado de su pedido #${idPedido} ha cambiado a ACEPTADO.`
            },
            data: { type: 'chat', order_id: idPedido }
        };

        await admin.messaging().send(message);

        res.status(200).json({
            msg: "Estado del pedido actualizado con éxito",
            data: rows[0],
            rta: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al actualizar el pedido: " + err.message,
            rta: false
        });
    }
}
const updateEstadoMotoPedido = async (req, res) => {
    const { idPedido } = req.params;
    const data = req.body;

    try {
        const query = `
            UPDATE pedido 
            SET order_status = $1, dealer_id = $2 
            WHERE order_id = $3 
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [data.estado, data.dealer, idPedido]);

        // Cuando se actualiza el estado del pedido, enviar notificacion al motorizado y al cliente con ayuda de firebase messaging
        const dealerMessage = {
            token: data.tokenCliente,
            notification: {
                title: "Nuevo pedido asignado",
                body: `Se le ha asignado un nuevo pedido #${idPedido}.`
            },
            data: { type: 'chat', order_id: idPedido }
        };

        await admin.messaging().send(dealerMessage);
        const clientMessage = {
            token: data.tokenCliente,
            notification: {
                title: "Estado del pedido actualizado",
                body: `El estado de su pedido #${idPedido} ha cambiado a EN CAMINO`
            },
            data: { type: 'chat', order_id: idPedido }
        };

        await admin.messaging().send(clientMessage);


        res.status(200).json({
            msg: "Estado y asignación del pedido actualizado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al actualizar el estado y la asignación del pedido: " + err.message,
            rta: false
        });
    }
}

const updateEstadoFechaPedido = async (req, res) => {
    const { idPedido } = req.params;
    const data = req.body;

    try {
        const query = `
            UPDATE pedido 
            SET order_status = $1, order_finish_date = $2 
            WHERE order_id = $3 
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [data.estado, data.fechaFinalizacion, idPedido]);

        res.status(200).json({
            msg: "Estado y fecha del pedido actualizado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al actualizar el estado y la fecha del pedido: " + err.message,
            rta: false
        });
    }
}


module.exports = {
    createPedido,
    getAllPedidos,
    getPedidoById,
    getPedidoByUserState,
    getPedidoByMotoState,
    updateEstadoPedido,
    updateEstadoMotoPedido,
    updateEstadoFechaPedido,
    getPedidoByMoto
};