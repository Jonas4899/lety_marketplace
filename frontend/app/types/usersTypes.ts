export type Owner = {
  id_usuario: number;
  nombre: string;
  correo: string;
  telefono: string;
}

export type Vet = {
  id_clinica: number;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;    
}

export type Pet = {
  id_mascota: number;
  nombre: string;
  edad: number;
  raza: string;
  especie: string;
  foto_url?: string;
}