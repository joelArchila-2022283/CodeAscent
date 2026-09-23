export interface ILabPista {
  id_pista: number;
  orden: number;
  texto: string;
}

export interface ILabOpcion {
  id_opcion: number;
  texto: string;
  es_correcta: boolean;
}

export interface ILabContext {
  id_leccion: number;
  slug_lenguaje: string;
  titulo_leccion: string;
  contenido_leccion: string;
  prediccion: {
    id_prediccion: number;
    pregunta: string;
    opciones: ILabOpcion[];
  } | null;
  pistas: ILabPista[];
}
