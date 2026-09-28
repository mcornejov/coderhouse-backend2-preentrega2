import { toUserDTO } from '../dto/user.dto.js';

// Repositorio de usuarios: abstrae el acceso a datos y entrega DTOs seguros
// hacia la capa de servicio, de modo que la contraseña nunca sube de esta capa.
export default class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(userData) {
    const user = await this.dao.create(userData);
    return toUserDTO(user);
  }

  async existsByEmail(email) {
    const user = await this.dao.findByEmail(email);
    return user !== null;
  }

  async findById(id) {
    const user = await this.dao.findById(id);
    return user ? toUserDTO(user) : null;
  }
}
