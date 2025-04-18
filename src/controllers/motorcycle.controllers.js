const { response } = require("express");
const pool = require("../db/db.js");

const createMoto = async (req, res) => {
    const data = req.body;
    const query = "INSERT INTO motocicleta(moto_color, moto_placa, moto_year, user_id) VALUES ($1, $2, $3, $4) RETURNING *;";
    try {
        const { rows } = await pool.query(query,
            [data.moto_color, data.moto_placa, data.moto_anio, data.usuario_id]
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
            msg: "Error al crear la motocicleta: "+error.message
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
            msg: "Error al obtener las motocicletas: "+error.message
        });
    }
};

module.exports = {
    createMoto,
    getAllMotos,
};