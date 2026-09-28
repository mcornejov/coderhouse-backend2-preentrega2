// DTO de usuario: define exactamente qué datos se exponen al cliente.
// Nunca incluye la contraseña (ni en texto plano ni hasheada) ni campos internos.
export function toUserDTO(user) {
  return {
    id: user._id.toString(),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
  };
}
