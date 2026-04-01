const { db } = require('./lib/firebaseAdmin');
const { Resend } = require('resend');

// Inicializamos Resend con la llave secreta de Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  // Configuración CORS (permite que tu frontend hable con tu backend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Responder rápido a la petición preflight (seguridad del navegador)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const userData = req.body;
    
    // Agregamos la fecha exacta del registro en el servidor
    userData.fecha_registro = new Date().toISOString();

    // 1. GUARDAR EN FIREBASE (Colección 'prospectos')
    const docRef = await db.collection('prospectos').add(userData);

    // 2. ENVIAR CORREO A KELLY (Si Resend está configurado)
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Kelly-Bot <onboarding@resend.dev>', // Por defecto en pruebas de Resend
        to: 'tu_correo_real@ejemplo.com', // <--- IMPORTANTE: CAMBIA ESTO POR TU CORREO REAL
        subject: `🔥 Nuevo Diagnóstico: ${userData.nombre}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #059669;">¡Nuevo Prospecto Registrado!</h2>
            <p>Se acaba de completar un nuevo diagnóstico de Inmunidad Patrimonial.</p>
            <ul>
              <li><strong>Nombre:</strong> ${userData.nombre}</li>
              <li><strong>País:</strong> ${userData.pais}</li>
              <li><strong>Email:</strong> ${userData.email}</li>
              <li><strong>Aceptó Política de Datos:</strong> ${userData.acepta_politica === 'si' ? '✅ Sí' : '❌ No'}</li>
            </ul>
            <p>Ingresa a tu <a href="https://tu-dominio-vercel.vercel.app/login.html">Portal de Administración</a> para ver los detalles financieros y el número de inmunidad.</p>
          </div>
        `
      });
    }

    // 3. RESPONDER AL FRONTEND CON ÉXITO
    return res.status(200).json({ success: true, reportId: docRef.id });
    
  } catch (error) {
    console.error("Error al procesar el reporte:", error);
    return res.status(500).json({ success: false, error: 'Error interno guardando los datos' });
  }
};
