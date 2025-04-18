const { response } = require("express");
const pool = require("../db/db.js");

const createProduct = async (req, res) => {
    const data = req.body;

    try {
        const query = `
            INSERT INTO producto 
            (product_name, product_description, product_img, base_price, iva_price, iva_value, iva_porcent, stock, category_id, product_type_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *;
        `;
        const values = [
            data.nombre,
            data.descripcion,
            data.imagen,
            data.precio_base,
            data.precio_iva,
            data.valor_iva,
            data.porcentaje_iva,
            data.stock,
            data.categoria,
            data.tipo_Producto,
        ];

        const { rows } = await pool.query(query, values);

        res.status(201).json({
            msg: "Producto registrado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al registrar el producto: "+error.message,
            rta: false
        });
    }
};
const getProductCategory = async (req, res) => {
    const id = req.params.idCategoria;
    try {
        const query = "SELECT * FROM producto WHERE category_id = $1;";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "Productos no encontrados",
                rta: false
            });
        }
        res.status(200).json({
            msg: "Lista de productos obtenida con éxito",
            data: rows,
            rta: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener los productos: "+error.message,
            rta: false
        });
    }
};

const updateProduct = async (req, res) => {
    const id = req.params.idProducto;
    const data = req.body;

    try {
        const query = `
            UPDATE producto 
            SET product_name = $1, product_description = $2, product_img = $3, base_price = $4, 
                iva_price = $5, iva_value = $6, iva_porcent = $7, stock = $8, category_id = $9, product_type_id = $10 
            WHERE product_id = $11 
            RETURNING *;
        `;
        const values = [
            data.nombre,
            data.descripcion,
            data.imagen,
            data.precio_base,
            data.precio_iva,
            data.valor_iva,
            data.porcentaje_iva,
            data.stock,
            data.categoria,
            data.tipo_Producto,
            id
        ];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "Producto no encontrado",
                rta: false
            });
        }

        res.status(200).json({
            msg: "Producto actualizado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al actualizar el producto: "+error.message,
            rta: false
        });
    }
};
const deleteProduct = async (req, res) => {
    const id = req.params.idProducto;

    try {
        const query = "DELETE FROM producto WHERE product_id = $1 RETURNING *;";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "Producto no encontrado",
                rta: false
            });
        }

        res.status(200).json({
            msg: "Producto eliminado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al eliminar el producto: "+error.message,
            rta: false
        });
    }
};

module.exports = {
    createProduct,
    getProductCategory,
    updateProduct,
    deleteProduct
};