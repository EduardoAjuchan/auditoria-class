// src/utils/auth.ts
export function guardarSesion(token: string, usuario: any) {
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function obtenerToken(): string | null {
  return localStorage.getItem("token");
}

export function obtenerUsuario(): any {
  const data = localStorage.getItem("usuario");
  return data ? JSON.parse(data) : null;
}
