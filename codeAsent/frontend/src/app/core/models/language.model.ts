export interface ILanguage {
  id_lenguaje: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  estado?: boolean;
}

export interface IMission {
  id_leccion: number;
  id_nivel: number;
  titulo: string;
  contenido: string;
  orden: number;
  numero_nivel?: number;
  estado?: 'locked' | 'available' | 'completed';
}
