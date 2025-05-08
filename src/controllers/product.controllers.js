const { response } = require("express");
const pool = require("../db/db.js");

const createProduct = async (req, res) => {
    const data = req.body;

    try {
        const query = `
            INSERT INTO producto 
            (product_name, product_description, product_img, base_price, iva_price, iva_value, iva_porcent, stock, category_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
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
            msg: "Error al registrar el producto: " + error.message,
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
            return res.status(200).json({
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
            msg: "Error al obtener los productos: " + error.message,
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
                iva_price = $5, iva_value = $6, iva_porcent = $7, stock = $8, category_id = $9
            WHERE product_id = $10
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
            msg: "Error al actualizar el producto: " + error.message,
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
            msg: "Error al eliminar el producto: " + error.message,
            rta: false
        });
    }
};

const getProductById = async (req, res) => {
    const id = req.params.idProducto;

    try {
        const query = "SELECT * FROM producto WHERE product_id = $1;";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "Producto no encontrado",
                rta: false
            });
        }

        res.status(200).json({
            msg: "Producto encontrado",
            data: rows[0],
            rta: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener el producto: " + error.message,
            rta: false
        });
    }
};
const getProductosPorLocal = async (req, res) => {
    const { enterprise_id } = req.query;
    try {
        const query = `
        SELECT 
            pr.product_id,
            pr.product_name,
            pr.product_description,
            pr.product_img,
            c.category_id,
            c.category_name,
            e.enterprise_id,
            e.enterprise_name,
            e.enterprise_description
        FROM 
            producto pr
        INNER JOIN categoria c ON pr.category_id = c.category_id
        INNER JOIN local_empresa e ON pr.enterprise_id = e.enterprise_id
        WHERE 
            e.enterprise_id = $1
        `;

        const values = [enterprise_id];
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "No se encontraron productos.",
                data: [],
                rta: false
            });
        }

        const productos = rows.map(row => ({
            product_id: row.product_id,
            product_name: row.product_name,
            product_description: row.product_description,
            product_img: row.product_img,
            categoria: {
                category_id: row.category_id,
                category_name: row.category_name
            },
            tienda: {
                enterprise_id: row.enterprise_id,
                enterprise_name: row.enterprise_name,
                enterprise_description: row.enterprise_description
            }
        }));

        res.status(200).json({
            msg: "Productos obtenidos con éxito",
            data: productos,
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al obtener los productos: " + err.message,
            rta: false
        });
    }
};


module.exports = {
    createProduct,
    getProductCategory,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductosPorLocal
};