export interface IQuizRespuesta {
  id_respuesta: number;
  texto_respuesta: string;
  es_correcta: boolean;
}

export interface IQuizReto {
  id_reto: number;
  enunciado: string;
  respuestas: IQuizRespuesta[];
}
