const pool = require("../db/db.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


/* Obtener el usuario por su id */
const getUserById = async (req, res) => {
    const { idUsuario } = req.params;

    try {
        const query = 'SELECT * FROM usuario WHERE user_id = $1';
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: 'Usuario no encontrado',
                rta: false
            });
        }

        res.status(200).json({
            msg: 'Usuario encontrado',
            data: rows[0],
            rta: true
        });

    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        res.status(500).json({
            msg: 'Error del servidor:'+err.message,
            rta: false
        });
    }
};

/* Obtener usuario por su cedula */
const getUserByCI = async (req, res) => {
    const { cedula } = req.params;

    try {
        const query = 'SELECT * FROM usuario WHERE ci = $1';
        const { rows } = await pool.query(query, [cedula]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: 'Usuario no encontrado',
                rta: false
            });
        }

        res.status(200).json({
            msg: 'Usuario encontrado',
            data: rows[0],
            rta: true
        });

    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        res.status(500).json({
            msg: 'Error del servidor:'+err.message,
            rta: false
        });
    }
};

/* Registrar nuevo usuario */
const register = async (req, res, next) => {
    const data = req.body;
    try {
        const checkQuery = `
            SELECT * FROM usuario 
            WHERE email = $1 OR ci = $2
        `;
        const checkResult = await pool.query(checkQuery, [data.correo, data.cedula]);

        if (checkResult.rows.length > 0) {

            return res.status(400).json({
                msg: "El correo o la cédula ya están registrados",
                err: "Duplicated fields",
                rta: false
            });
        }

        const hashedPass = await bcrypt.hash(data.contrasenia, 10);

        const { rows } = await pool.query(
            "INSERT INTO usuario (first_names, last_names, email, ci, notification_token, state, active, password, user_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [data.nombres, data.apellidos, data.correo, data.cedula, data.token_notific, data.estado, data.activo, hashedPass, data.tipo_usuario]
        );

        res.status(201).json({
            msg: "Usuario registrado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al registrar el usuario ",
            err: err.message,
            rta: false
        });
    }
}

/* Metodo para realizar el login */
const login = async (req, res, next) => {
    const { cedula, contrasenia } = req.body;

    try {
        const result = await pool.query(
            "SELECT user_id, first_names, last_names, email, ci, notification_token, state, active, password, user_type_id FROM usuario WHERE ci = $1",
            [cedula]
        );

        const moto = await pool.query(
            "SELECT moto_id, moto_color, moto_placa, moto_year FROM motocicleta WHERE user_id = $1",
            [result.rows[4]]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                msg: "Usuario incorrecto",
                rta: false
            });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(contrasenia, user.password);

        if (!match) {
            return res.status(401).json({
                msg: "Contraseña incorrecta",
                rta: false
            });
        }

        const token = jwt.sign(
            { id: user.id_usuario, nombres: user.nombres },
            "verySecretValue",
            { expiresIn: "1h" }
        );

        const usuario = {
            id_usuario: user.user_id,
            nombres: user.first_names,
            apellidos: user.last_names,
            cedula: user.ci,
            correo: user.email,
            tokenNotific: user.notification_token,
            activo: user.active,
            estado: user.state,
            id_tipo_usuario: user.user_type_id,
            moto: moto.rows[0],
            token,
            ...(moto.rows.length > 0 && { moto: moto.rows[0] })
        };

        return res.status(200).json({
            msg: "Inicio de sesión exitoso!",
            data:usuario,
            rta: true
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            msg: "Error en el servidor: "+err.message,
            rta: false
        });
    }
}
/* Actualizar el estado del usuario */
const UpdateUserStatus = async (req, res) => {
    const { idUsuario } = req.params;
    const { estado } = req.body;
    try {
        const query = `
            UPDATE usuario 
            SET state=$1 
            WHERE user_id = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [estado, idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: `No se encontró un usuario con el ID ${idUsuario}`,
                rta: false
            });
        }

        res.status(200).json({
            msg: "Estado del usuario actualizado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al actualizar el estado del usuario: "+err.message,
            rta: false
        });
    }
};

/* Metodo para actualizar el usuario */
const updateUser = async (req, res) => {
    const { idUsuario } = req.params;
    const data = req.body;
    try {
        const query = `
            UPDATE usuario
	        SET  ci=$1, first_names=$2, last_names=$3, notification_token=$4, email=$5, active=$6, state=$7, user_type_id=$8 
            WHERE user_id = $9
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [data.cedula, data.nombres, data.apellidos, data.token_notific, data.correo, data.activo, data.estado, data.id_tipo_usuario, idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: `No se encontró un usuario con el ID ${idUsuario}`,
                rta: false
            });
        }

        res.status(200).json({
            msg: "Usuario actualizado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al actualizar el usuario: "+err.message,
            rta: false
        });
    }
};

/* Metodo para actualizar la contraseña del usuario */
const updateUserContrasenia = async (req, res) => {
    const { idUsuario } = req.params;
    const { contrasenia } = req.body;

    if (!contrasenia) {
        return res.status(400).json({
            msg: "El campo 'contrasenia' es obligatorio",
            rta: false
        });
    }
    const hashedPass = await bcrypt.hash(contrasenia, 10);
    try {
        const query = `
            UPDATE usuario
	        SET  password=$1 
            WHERE user_id = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [hashedPass, idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: `No se encontró un usuario con el ID ${idUsuario}`,
                rta: false
            });
        }

        res.status(200).json({
            msg: "Contraseña del usuario actualizada con éxito",
            data: rows[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al actualizar la contraseña: "+err.message,
            rta: false
        });
    }
}; 
/* Actualizar token de notificaciones */
const updateUserToken = async (req, res) => {
    const { idUsuario } = req.params;
    const { tokenNotific } = req.body;

    if (!tokenNotific) {
        return res.status(400).json({
            msg: "El campo 'tokenNotific' es obligatorio",
            rta: false
        });
    }
    try {
        const query = `
            UPDATE usuario
	        SET  notification_token=$1
            WHERE user_id = $2
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [tokenNotific, idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({
                msg: `No se encontró un usuario con el ID ${idUsuario}`,
                rta: false
            });
        }

        res.status(200).json({
            msg: "token del usuario actualizado con éxito",
            data: rows[0],
            rta: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Error al actualizar el token del usuario: "+err.message,
            rta: false
        });
    }
};

module.exports = {
    register, login, UpdateUserStatus, updateUser, updateUserContrasenia, updateUserToken, getUserByCI, getUserById
}
