export type Owner = {
  id_usuario: number;
  nombre: string;
  correo: string;
  telefono: string;
  mascotas: Array<Pet>;
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
  genero: String;
  peso: number,
  foto_url?: string;
}