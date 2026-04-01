const { db } = require('./lib/firebaseAdmin');
const { Resend } = require('resend');

// Inicializamos Resend con la llave secreta configurada en Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  // Configuración de cabeceras para permitir peticiones desde el frontend (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Manejo de peticiones de seguridad (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo se permiten peticiones de tipo POST para guardar datos
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const userData = req.body;
    
    // Asignamos la fecha de registro en el servidor para ordenamiento
    userData.fecha_registro = new Date().toISOString();

    // 1. Guardar la información en la colección 'prospectos' de Firestore
    const docRef = await db.collection('prospectos').add(userData);

    // 2. Enviar notificación por correo a Kelly usando Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Kelly-Bot <onboarding@resend.dev>', // Remitente por defecto de Resend
        to: 'kelly.rincon.finanzas@gmail.com', // Tu correo real actualizado
        subject: `🔥 Nuevo Diagnóstico: ${userData.nombre}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #10b981;">¡Nuevo Prospecto Registrado!</h2>
            <p>Se ha completado un nuevo diagnóstico de Inmunidad Patrimonial en la plataforma.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981;">
              <ul style="list-style: none; padding: 0;">
                <li><strong>Nombre:</strong> ${userData.nombre}</li>
                <li><strong>País:</strong> ${userData.pais}</li>
                <li><strong>Ciudad:</strong> ${userData.ciudad}</li>
                <li><strong>Email:</strong> ${userData.email}</li>
                <li><strong>Aceptó Política:</strong> ${userData.acepta_politica === 'si' ? '✅ Sí' : '❌ No'}</li>
              </ul>
            </div>
            <p style="margin-top: 20px;">
              Puedes revisar el análisis completo ingresando a tu 
              <a href="https://tu-proyecto.vercel.app/login.html" style="color: #10b981; font-weight: bold;">Portal Administrativo</a>.
            </p>
          </div>
        `
      });
    }

    // Respuesta exitosa al frontend con el ID generado
    return res.status(200).json({ success: true, reportId: docRef.id });
    
  } catch (error) {
    console.error("Error al procesar el reporte:", error);
    return res.status(500).json({ success: false, error: 'Error interno guardando los datos' });
  }
};
