import bcrypt from 'bcrypt';

// Rondas de salt para bcrypt. Configurable por entorno; 10 es el valor recomendado.
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Genera el hash irreversible de una contraseña (incluye el salt en el resultado)
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compara una contraseña en texto plano contra un hash almacenado (se usará en el login)
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
