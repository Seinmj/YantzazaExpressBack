const { response } = require("express");
const pool = require("../db/db.js");

const getCategoryMaster = async (req, res) => {
    try {
        const query = "SELECT * FROM categoria_master;";
        const { rows } = await pool.query(query);

        res.status(200).json({
            msg: "Categorias-Maestras obtenidas con éxito",
            data: rows,
            rta:true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener las categorias: "+error.message,
            rta: false
        });
    }
};

const createCategoryMaster = async (req, res) => {
    const data = req.body;
    try {
        const { rows } = await pool.query("INSERT INTO categoria_master( name_master_category) VALUES ($1) RETURNING *",
            [data.nombre_categoria]
        );
        res.status(200).json({
            msg: "Categoria-Maestra registrada",
            data: rows[0],
            rta:true
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al crear la categoria: "+error.message,
            rta:false
        });
    }
}
const updateCategoryMaster = async (req, res) => {
    const {categoria_id} = req.params;
    const data = req.body;
    try {
        const { rows } = await pool.query("UPDATE categoria_master SET name_master_category=$1 WHERE master_category_id=$2 RETURNING *;",[data.nombre_categoria, categoria_id]
        );
        res.status(200).json({
            msg: "Categoria-Maestra actualizada",
            data: rows[0],
            rta:true
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al actualizar la categoria: "+error.message,
            rta:false
        });
    }
}

/************************************* Categorias **************************** */

const getCategory = async (req, res) => {
    const id = req.params.empresa_id
    try {
        const query = "SELECT * FROM categoria WHERE enterprise_id=$1;";
        const { rows } = await pool.query(query,[id]);

        res.status(200).json({
            msg: "Categorias obtenidas con éxito",
            data: rows,
            rta:true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener las categorias: "+error.message,
            rta: false
        });
    }
};

const createCategory = async (req, res) => {
    const data = req.body;
    try {
        const { rows } = await pool.query("INSERT INTO categoria( category_name, category_description, enterprise_id) VALUES ($1, $2, $3) RETURNING *",
            [data.nombre_categoria, data.descripcion_categoria, data.empresa_id]
        );
        res.status(200).json({
            msg: "Categoria registrada",
            data: rows[0],
            rta:true
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al crear la categoria: "+error.message,
            rta:false
        });
    }
}
const updateCategory = async (req, res) => {
    const {categoria_id} = req.params;
    const data = req.body;
    try {
        const { rows } = await pool.query("UPDATE categoria SET category_name = $1, category_description = $2, enterprise_id = $3 WHERE category_id = $4 RETURNING *;",[data.nombre_categoria, data.descripcion_categoria, data.empresa_id, categoria_id]);
        res.status(200).json({
            msg: "Categoria actualizada",
            data: rows[0],
            rta:true
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al actualizar la categoria: "+error.message,
            rta:false
        });
    }
}

module.exports = {
    getCategory,
    getCategoryMaster,
    createCategory,
    createCategoryMaster,
    updateCategory,
    updateCategoryMaster
};