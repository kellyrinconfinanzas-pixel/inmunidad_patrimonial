const { db } = require('./lib/firebaseAdmin');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Aquí podrías validar un token de sesión si quisieras más seguridad
  
  try {
    const snapshot = await db.collection('prospectos').orderBy('fecha_registro', 'desc').get();
    const prospectos = [];
    
    snapshot.forEach(doc => {
      prospectos.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, prospectos });
  } catch (error) {
    console.error("Error obteniendo prospectos:", error);
    return res.status(500).json({ success: false, error: 'Error al leer la base de datos' });
  }
};
