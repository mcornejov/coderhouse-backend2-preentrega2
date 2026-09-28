// Helpers de respuesta para mantener un formato uniforme en toda la API:
// éxito → { status: 'success', payload } · error → { status: 'error', message }
export function responderExito(res, payload, status = 200) {
  return res.status(status).json({ status: 'success', payload });
}

export function responderCreado(res, payload) {
  return responderExito(res, payload, 201);
}

export function responderError(res, status, message) {
  return res.status(status).json({ status: 'error', message });
}
