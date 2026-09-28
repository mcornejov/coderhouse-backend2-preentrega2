import { BadRequestError, ConflictError } from '../utils/errors.util.js';
import { hashPassword } from '../utils/hash.js';
import {
  isNonEmptyString,
  isValidEmail,
  normalizeEmail,
  PASSWORD_MIN_LENGTH,
} from '../utils/validators.js';

// Campos que el registro público acepta del cliente. El rol NO está en la lista:
// siempre se asigna el valor por defecto del modelo (menor privilegio).
const CAMPOS_REGISTRO = ['first_name', 'last_name', 'email', 'password'];

// Capa de negocio de sesiones: reglas de identidad (validación, unicidad,
// protección de contraseñas). No conoce HTTP ni Mongoose.
export default class SessionsService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async register(datos = {}) {
    // 1. Presencia de campos obligatorios
    const faltantes = CAMPOS_REGISTRO.filter((campo) => !isNonEmptyString(datos[campo]));
    if (faltantes.length > 0) {
      throw new BadRequestError('Faltan campos obligatorios');
    }

    // 2. Formato de email y longitud mínima de contraseña
    if (!isValidEmail(datos.email)) {
      throw new BadRequestError('El email no tiene un formato válido');
    }
    if (datos.password.length < PASSWORD_MIN_LENGTH) {
      throw new BadRequestError(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
    }

    // 3. Normalización y unicidad del email
    const email = normalizeEmail(datos.email);
    if (await this.usersRepository.existsByEmail(email)) {
      throw new ConflictError('El email ya está registrado');
    }

    // 4. La contraseña nunca se persiste en texto plano
    const password = await hashPassword(datos.password);

    // 5. Persistencia con whitelist de campos (el rol queda en su valor por defecto)
    return this.usersRepository.create({
      first_name: datos.first_name.trim(),
      last_name: datos.last_name.trim(),
      email,
      password,
    });
  }
}
