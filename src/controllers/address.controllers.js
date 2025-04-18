const { response } = require("express");
const pool = require("../db/db.js");

/* Metodo para crear una direccion al usuario */
const createUserAddress = async (req, res) => {
    const data = req.body;
    try {
        const { rows } = await pool.query("INSERT INTO direcciones_usuario( latitude, longitude, principal_street, secondary_street, alias, description, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [data.latitud, data.longitud, data.callePrincipal, data.calleSecundaria, data.alias, data.descripcion, data.usuario_id]
        );
        res.status(200).json({
            msg: "Direccion registrada",
            data: rows[0],
            rta:true
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener las direcciones: "+error.message,
            rta:false
        });
    }
}

/* Obtener lista de direcciones de un usuario */
const getUserAddress = async (req, res) => {
    const id = req.params.idUsuario;
    try {
        const query = "SELECT * FROM direcciones_usuario WHERE user_id = $1;";
        const { rows } = await pool.query(query,[id]);

        res.status(200).json({
            msg: "Lista de direcciones obtenida con éxito",
            data: rows,
            rta:true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener las direcciones: "+error.message,
            rta: false
        });
    }
};
const getAddressIdLicorera = async (req, res) => {
    const id = req.params.idLicorera;
    try {
        //const query = "SELECT l.id_licorera, d.* FROM licorera l, direccion d WHERE l.id_direccion = d.id_direccion AND l.id_licorera= $1;";
        const query = "SELECT l.id_licorera, dl. * FROM direccion_licorera dl, licorera l WHERE dl.id_licorera = l.id_licorera AND dl.id_licorera= $1;";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Direccion no encontrada",
                response: false
            });
        } else {
            res.status(200).json({
                message: "Dirección obtenida con éxito",
                direcciones: rows,
                response: true
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la direccion",
            error: error.message,
            response: false
        });
    }
};

const getAddressById = async (req, res) => {
    const id = req.params.id;

    try {
        const query = "SELECT * FROM direccion WHERE id_direccion = $1;";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Direccion no encontrada"
            });
        }

        res.status(200).json({
            message: "Direccion obtenida con éxito",
            direccion: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la direccion",
            error: error.message
        });
    }
};

const updateAddress = async (req, res) => {
    const id = req.params.idDireccion;
    const data = req.body;

    try {
        const query = `
            UPDATE direcciones_usuario 
	        SET latitude=$1, longitude=$2, principal_street=$3, secondary_street=$4, alias=$5, description=$6, user_id=$7
            WHERE direction_id = $7 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            data.latitud,
            data.longitud,
            data.calle_principal,
            data.calle_secundaria,
            data.alias,
            data.descripcion,
            data.usuario_id,
            id
        ]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: "Direccion no encontrada",
                rta: false
            });
        }

        res.status(200).json({
            msg: "Direccion actualizada con éxito",
            data: rows[0],
            rta: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al actualizar la Direccion: "+error.message,
            rta: false
        });
    }
};
const updateUserAddress = async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    try {
        const query = `
            UPDATE direccion_usuario
            SET latitud=$1, longitud=$2, calle_principal=$3, calle_secundaria=$4, referencia=$5, id_usuario=$6
            WHERE id_direccion_usuario = $7 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [
            data.latitud,
            data.longitud,
            data.calle_principal,
            data.calle_secundaria,
            data.referencia,
            data.id_usuario,
            id
        ]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Direccion no encontrada",
                response: false
            });
        }

        res.status(200).json({
            message: "Direccion actualizada con éxito",
            direccion: rows[0],
            response: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la Direccion",
            error: error.message,
            response: false
        });
    }
};

const deleteAddress = async (req, res) => {
    const id = req.params.id;

    try {
        const query = "DELETE FROM direccion WHERE id_direccion = $1 RETURNING *;";
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Direccion no encontrada"
            });
        }

        res.status(200).json({
            message: "Direccion eliminada con éxito",
            direccion: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la direccion",
            error: error.message
        });
    }
};
const getAddressIdUser = async (req, res) => {
    const id = req.params.idUsuario;
    try {
        //const query = "SELECT du.id_direccion_usuario,du.id_usuario, d.* FROM direccion_usuario du, direccion d WHERE du.id_direccion = d.id_direccion AND du.id_usuario= $1;";
        const query = "SELECT u.id_usuario, du. * FROM direccion_usuario du, usuario u WHERE du.id_usuario = u.id_usuario AND du.id_usuario= $1;";
        const { rows } = await pool.query(query, [id]);

        res.status(200).json({
            message: "Lista de direcciones de usuario obtenida con éxito",
            direcciones: rows,
            response: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las direcciones",
            error: error.message,
            response: false
        });
    }
};
const createAddressUser = async (req, res) => {
    const { idUsuario } = req.params;
    const data = req.body;
    try {
        const { rows } = await pool.query("INSERT INTO direccion_usuario(latitud, longitud, calle_principal, calle_secundaria, referencia, id_usuario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [data.latitud, data.longitud, data.callePrincipal, data.calleSecundaria, data.referencia, idUsuario]
        );

        console.log(rows[0])

        res.status(201).json({
            message: 'Dirección credada con éxito',
            usuario: { id_usuario: idUsuario },
            direccion: { ...rows[0] },
            response: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las direcciones",
            error: error.message,
            response: false
        });
    }
};


module.exports = {
    createUserAddress,
    getUserAddress,
    updateAddress
};