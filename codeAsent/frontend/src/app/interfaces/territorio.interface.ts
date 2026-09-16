export interface PinTerritorio {
  id: number;
  nombre: string;
  lenguaje: string;
  estado: 'en_curso' | 'bloqueado' | 'completado';
  posX: number;
  posY: number;
  ruta: string;
  corte?: string;
}