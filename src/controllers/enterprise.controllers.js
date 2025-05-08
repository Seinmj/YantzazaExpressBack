const { response } = require("express");
const pool = require("../db/db.js");

/* Obtener la lista de empresas */
const getEnterprise = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM local_empresa');
        res.status(200).json({
            rta: true,
            msg: "Lista de empresas",
            data: rows
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            rta: false,
            msg: "Error al obtener las empresas: " + err.message
        });
    }
};

/* Obtener una de empresas */
const getEnterpriseById = async (req, res) => {
    const { empresa_id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM local_empresa WHERE enterprise_id = $1', [empresa_id]);

        if (rows.length === 0) {
            return res.status(200).json({
                rta: false,
                msg: "Empresa no encontrada"
            });
        }

        res.status(200).json({
            rta: true,
            msg: "Empresa obtenida con éxito",
            data: rows[0]
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            rta: false,
            msg: "Error al obtener la empresa: " + err.message
        });
    }
};
/* metodo para Crear la empresa */
const createEnterprise = async (req, res) => {
    const {
        enterprise_name,
        enterprise_description,
        enterprise_open,
        latitude,
        longitude,
        principal_street,
        secondary_street,
        enterprise_img,
        initial_control_date,
        final_control_date,
        active,
        user_id,
        master_category_id
    } = req.body;

    try {
        const { rows } = await pool.query(`
            INSERT INTO local_empresa (
                enterprise_name, enterprise_description, enterprise_open, latitude,
                longitude, principal_street, secondary_street, enterprise_img,
                initial_control_date, final_control_date, active, user_id, master_category_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
        `, [
            enterprise_name, enterprise_description, enterprise_open, latitude,
            longitude, principal_street, secondary_street, enterprise_img,
            initial_control_date, final_control_date, active, user_id, master_category_id
        ]);

        res.status(200).json({
            rta: true,
            msg: "Empresa registrada",
            data: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            rta: false,
            msg: "Error al crear la empresa: " + err.message
        });
    }
};
/* Metodo para actualizar la empresa */
const updateEnterprise = async (req, res) => {
    const { idEmpresa } = req.params;
    const {
        enterprise_name,
        enterprise_description,
        enterprise_open,
        latitude,
        longitude,
        principal_street,
        secondary_street,
        enterprise_img,
        initial_control_date,
        final_control_date,
        active,
        user_id,
        master_category_id
    } = req.body;

    try {
        const { rows } = await pool.query(`
            UPDATE local_empresa SET
                enterprise_name = $1,
                enterprise_description = $2,
                enterprise_open = $3,
                latitude = $4,
                longitude = $5,
                principal_street = $6,
                secondary_street = $7,
                enterprise_img = $8,
                initial_control_date = $9,
                final_control_date = $10,
                active = $11,
                user_id = $12,
                master_category_id = $13 
            WHERE enterprise_id = $14
        `, [
            enterprise_name, enterprise_description, enterprise_open, latitude,
            longitude, principal_street, secondary_street, enterprise_img,
            initial_control_date, final_control_date, active, user_id, master_category_id, idEmpresa
        ]);
        if (rows === 0) return res.status(200).json({ rta: false, msg: 'Empresa no encontrada' });
        res.status(200).json({
            rta: true,
            msg: "Empresa actualizada",
            data: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            rta: false,
            msg: "Error al actualizar la empresa: " + err.message
        });
    }
};

const deleteEnterprise = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query('DELETE FROM local_empresa WHERE enterprise_id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ msg: 'Empresa no encontrada' });

        res.json({
            msg: 'Empresa eliminada correctamente',
            rta: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            rta: false,
            msg: "Error al eliminar la empresa: " + err.message
        });
    }
};

/* Obtener la lista de empresas */
const getEnterpriseCategory = async (req, res) => {
    const { categoria_id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM local_empresa WHERE master_category_id=$1', [categoria_id]);
        res.status(200).json({
            rta: true,
            msg: "Lista de empresas obtenidas con éxito",
            data: rows
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            rta: false,
            msg: "Error al obtener las empresas: " + err.message
        });
    }
};

module.exports = {
    getEnterprise,
    getEnterpriseById,
    createEnterprise,
    updateEnterprise,
    deleteEnterprise,
    getEnterpriseCategory
};