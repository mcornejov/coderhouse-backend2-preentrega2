import { HttpError } from '../utils/errors.util.js';
import { responderCreado } from '../utils/responses.util.js';

// Controlador de sesiones: extrae el body, delega en el servicio y responde en HTTP.
// Login, current y logout se implementan con JWT y Passport en la próxima entrega.
export default class SessionsController {
  constructor(service) {
    this.service = service;
  }

  register = async (req, res, next) => {
    try {
      const usuario = await this.service.register(req.body);
      return responderCreado(res, usuario);
    } catch (error) {
      return next(error);
    }
  };

  login = (req, res, next) => {
    return next(new HttpError(501, 'El inicio de sesión se implementará en la próxima entrega'));
  };

  current = (req, res, next) => {
    return next(new HttpError(501, 'La consulta del usuario actual se implementará en la próxima entrega'));
  };

  logout = (req, res, next) => {
    return next(new HttpError(501, 'El cierre de sesión se implementará en la próxima entrega'));
  };
}
