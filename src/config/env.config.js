import dotenv from 'dotenv';

// Carga las variables de entorno lo antes posible en el ciclo de vida de la app
dotenv.config({ quiet: true });

// Variables obligatorias para que la aplicación pueda iniciar
const REQUERIDAS = ['PORT', 'NODE_ENV', 'MONGO_URL'];

// Validación Fail-Fast: si falta alguna variable obligatoria, la app no arranca
const faltantes = REQUERIDAS.filter((clave) => !process.env[clave]);

if (faltantes.length > 0) {
  console.error(
    `Error de configuración: faltan variables de entorno obligatorias: ${faltantes.join(', ')}.`
  );
  console.error('Revisa tu archivo .env tomando como referencia .env.example.');
  process.exit(1);
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Error de configuración: PORT debe ser un entero entre 1 y 65535 (valor recibido: "${process.env.PORT}").`);
  process.exit(1);
}

const config = {
  port,
  nodeEnv: process.env.NODE_ENV,
  mongoUrl: process.env.MONGO_URL,
  // Opcional en esta etapa: se vuelve obligatoria cuando se integre el login con JWT
  jwtSecret: process.env.JWT_SECRET || null,
};

export default config;
