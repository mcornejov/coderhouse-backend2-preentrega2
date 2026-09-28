// Error con código HTTP asociado. Las capas internas lanzan estos errores y
// el middleware global los traduce a la respuesta correspondiente.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Petición inválida') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'El recurso ya existe') {
    super(409, message);
    this.name = 'ConflictError';
  }
}
