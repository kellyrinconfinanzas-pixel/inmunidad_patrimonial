module.exports = async function handler(req, res) {
  // Configuración CORS para Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const { password } = req.body;
    
    // Validar con la variable de entorno de Vercel
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error("ALERTA: Falta configurar ADMIN_PASSWORD en Vercel.");
      return res.status(500).json({ success: false, message: 'Error de configuración del servidor' });
    }
    
    if (password === adminPassword) {
        // Generamos un token temporal para tu sesión en el navegador
        const token = Buffer.from(`admin_kelly_${Date.now()}`).toString('base64');
        return res.status(200).json({ success: true, token: token });
    } else {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
