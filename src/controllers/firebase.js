const admin = require("firebase-admin");

// Ruta al archivo JSON de la cuenta de servicio
const serviceAccount = require("../../firebase/yantzazaexpress-c1606-firebase-adminsdk-fbsvc-382c462a73.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;