const admin = require('firebase-admin');

// Evitamos inicializar la app múltiples veces (un error común en Vercel)
if (!admin.apps.length) {
  try {
    // 1. Obtener la variable de entorno en Base64
    const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!base64ServiceAccount) {
      throw new Error('Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT_BASE64 en Vercel.');
    }

    // 2. Decodificar de Base64 a texto plano (JSON)
    const decodedServiceAccount = Buffer.from(base64ServiceAccount, 'base64').toString('utf8');

    // 3. Convertir el texto JSON a un objeto de JavaScript
    const credentials = JSON.parse(decodedServiceAccount);

    // 4. Inicializar Firebase con el objeto convertido
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    console.log("Firebase Admin inicializado correctamente (vía Base64).");
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error.message);
  }
}

const db = admin.firestore();

module.exports = { db };
