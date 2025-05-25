const admin = require("firebase-admin");

// Ruta al archivo JSON de la cuenta de servicio
const serviceAccount = require("../../firebase/yantzazaexpress-d1e68-firebase-adminsdk-fbsvc-f37898d82c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;