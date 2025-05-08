const { response } = require("express");
const pool = require("../db/db.js");

const createMoto = async (req, res) => {
    const data = req.body;
    const query = "INSERT INTO motocicleta(moto_color, moto_model, moto_placa, moto_year, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;";
    try {
        const { rows } = await pool.query(query,
            [data.moto_color, data.moto_model, data.moto_placa, data.moto_anio, data.usuario_id]
        );
        res.status(200).json({
            rta: true,
            msg: "Motocicleta registrada",
            data: rows[0]
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            rta: false,
            msg: "Error al crear la motocicleta: " + error.message
        });
    }
};

/* Obtener motos por user_id */
const getMotosByUserId = async (req, res) => {
    const { user_id } = req.params;
    try {
        const query = "SELECT * FROM motocicleta WHERE user_id = $1;";
        const { rows } = await pool.query(query, [user_id]);

        if (rows.length === 0) {
            return res.status(200).json({
                msg: "No hay motocicletas registradas para este usuario",
                rta: false
            });
        }
        res.status(200).json({
            msg: "Lista de motocicletas obtenida con éxito",
            data: rows[0],
            rta: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            rta: false,
            msg: "Error al obtener las motocicletas: " + error.message
        });
    }
};

const getAllMotos = async (req, res) => {
    try {
        const query = `SELECT * FROM motocicleta;`;
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(200).json({
                rta: true,
                msg: "No hay motocicletas registradas"
            });
        }
        res.status(200).json({
            msg: "Lista de motociletas obtenida con éxito",
            data: rows,
            rta: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            rta: false,
            msg: "Error al obtener las motocicletas: " + error.message
        });
    }
};

/* Metodo para actualizar la informacion del vehiculo del repartidor */
const updateMoto = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const query = "UPDATE motocicleta SET moto_color = $1, moto_model = $2, moto_placa = $3, moto_year = $4 WHERE id_moto = $5 RETURNING *;";
    try {
        const { rows } = await pool.query(query,
            [data.moto_color, data.moto_model, data.moto_placa, data.moto_anio, id]
        );
        res.status(200).json({
            rta: true,
            msg: "Motocicleta actualizada",
            data: rows[0]
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            rta: false,
            msg: "Error al actualizar la motocicleta: " + error.message
        });
    }
};

module.exports = {
    createMoto,
    getAllMotos,
    getMotosByUserId
};