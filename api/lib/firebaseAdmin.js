const admin = require('firebase-admin');

// Evitamos inicializar la app múltiples veces (un error común en Vercel)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel a veces escapa mal los saltos de línea de la llave privada, esto lo soluciona
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      }),
    });
    console.log("Firebase Admin inicializado correctamente.");
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error.stack);
  }
}

const db = admin.firestore();

module.exports = { db };
