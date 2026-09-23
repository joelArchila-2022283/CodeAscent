export interface ColumnaTablaSql {
  nombre: string;
  tipo: string;
}

export interface FilaTablaSql {
  [columna: string]: string | number | boolean | null;
}

export interface TablaMisionSql {
  nombre: string;
  descripcion: string;
  columnas: ColumnaTablaSql[];
  filas: FilaTablaSql[];
}

export interface PreguntaDiagnosticoSql {
  pregunta: string;
  opciones: string[];
  indiceCorrecto: number;
  explicacion: string;
}

export type TemaGraficoSql =
  | 'explorar'
  | 'proyectar'
  | 'filtrar'
  | 'ordenar'
  | 'agregar'
  | 'agrupar'
  | 'unir'
  | 'preservar'
  | 'subconsulta'
  | 'mutar';

export interface MisionSqlConfig {
  numero: number;
  codigo: string;
  titulo: string;
  tema: string;
  temaGrafico: TemaGraficoSql;
  objetivoClaro: string;
  contexto: string;
  nivelConceptual: string;
  nivelLogico: string;
  nivelSintactico: string;
  ejemploSql: string;
  tablas: TablaMisionSql[];
  consultaCorrecta: string;
  clavesValidacion: string[];
  resultadoColumnas: string[];
  resultadoFilas: FilaTablaSql[];
  preguntaRazonamiento: string;
  opcionesPrediccion: string[];
  indicePrediccionCorrecta: number;
  pistas: string[];
  retroalimentacionError: string;
  resolucionComentada: string;
  preguntasDiagnostico: PreguntaDiagnosticoSql[];
  xpRecompensa: number;
}

export const MISIONES_SQL: MisionSqlConfig[] = [
  {
    numero: 1,
    codigo: 'SQL-01',
    titulo: 'Introducción a Bases de Datos',
    tema: 'SELECT * (exploración total)',
    temaGrafico: 'explorar',
    objetivoClaro:
      'Escribe la consulta que devuelva TODAS las filas y TODAS las columnas de la tabla libros: SELECT * FROM libros;',
    contexto:
      'Acabas de entrar como administrador de la Biblioteca Municipal y necesitas verificar que el catálogo digital está completo antes de abrir al público.',
    nivelConceptual:
      'Una base de datos relacional (RDBMS) guarda la información en tablas que se relacionan entre sí. Piensa en un archivador: la BASE DE DATOS es el edificio, una TABLA es la carpeta rotulada (ej. libros), una FILA es la ficha de un libro, una COLUMNA es la casilla de la ficha (titulo, autor...) y una CELDA es el dato (p. ej. "Cien años de soledad").',
    nivelLogico:
      'El motor SQL NO ejecuta la sentencia en el orden en que la escribes. Primero ejecuta FROM (localiza la tabla y lee sus registros) y después SELECT (proyecta las columnas pedidas). Con el comodín * no descartas ninguna columna.',
    nivelSintactico:
      'SELECT * FROM libros;\n\n- SELECT: indica qué quieres extraer (proyección).\n- *: comodín que significa "todas las columnas".\n- FROM libros: de qué tabla se leen los datos.\n- ; : marca el fin de la sentencia.',
    ejemploSql: 'SELECT * FROM libros;',
    tablas: [
      {
        nombre: 'libros',
        descripcion: 'Catálogo de la Biblioteca Municipal.',
        columnas: [
          { nombre: 'id', tipo: 'INTEGER' },
          { nombre: 'titulo', tipo: 'VARCHAR' },
          { nombre: 'autor', tipo: 'VARCHAR' },
          { nombre: 'anio_publicacion', tipo: 'INTEGER' },
          { nombre: 'stock', tipo: 'INTEGER' },
        ],
        filas: [
          {
            id: 1,
            titulo: 'Cien años de soledad',
            autor: 'Gabriel García Márquez',
            anio_publicacion: 1967,
            stock: 12,
          },
          {
            id: 2,
            titulo: 'El principito',
            autor: 'Antoine de Saint-Exupéry',
            anio_publicacion: 1943,
            stock: 30,
          },
          {
            id: 3,
            titulo: 'Don Quijote de la Mancha',
            autor: 'Miguel de Cervantes',
            anio_publicacion: 1605,
            stock: 8,
          },
          {
            id: 4,
            titulo: 'La casa de los espíritus',
            autor: 'Isabel Allende',
            anio_publicacion: 1982,
            stock: 5,
          },
        ],
      },
    ],
    consultaCorrecta: 'SELECT * FROM libros;',
    clavesValidacion: ['select * from libros'],
    resultadoColumnas: ['id', 'titulo', 'autor', 'anio_publicacion', 'stock'],
    resultadoFilas: [
      {
        id: 1,
        titulo: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        anio_publicacion: 1967,
        stock: 12,
      },
      {
        id: 2,
        titulo: 'El principito',
        autor: 'Antoine de Saint-Exupéry',
        anio_publicacion: 1943,
        stock: 30,
      },
      {
        id: 3,
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        anio_publicacion: 1605,
        stock: 8,
      },
      {
        id: 4,
        titulo: 'La casa de los espíritus',
        autor: 'Isabel Allende',
        anio_publicacion: 1982,
        stock: 5,
      },
    ],
    preguntaRazonamiento:
      'Antes de escribir código: si quieres ver TODO el contenido de la tabla libros sin recortar ni campos ni registros, ¿qué símbolo o combinación palabras claves utilizas?',
    opcionesPrediccion: [
      'SELECT * FROM libros',
      'SELECT titulo FROM libros',
      'SELECT libros FROM *',
      'SELECT (libros)',
    ],
    indicePrediccionCorrecta: 0,
    pistas: [
      'Quieres ver la tabla completa, sin recortar filas ni campos.',
      'Combina SELECT con el comodín de "todo" y la cláusula FROM.',
      'El comodín para todas las columnas es el asterisco * y la tabla se llama libros.',
      'Casi está resuelto: SELECT * FROM libros;',
    ],
    retroalimentacionError:
      'Tu sentencia aún no devuelve el catálogo completo. Revisa que uses SELECT *, que la tabla se llame libros (en plural) y que escribas FROM entre ambos.',
    resolucionComentada:
      'SELECT * FROM libros; — el * proyecta las 5 columnas y, al no haber WHERE, se conservan las 4 filas: 5 columnas x 4 filas.',
    preguntasDiagnostico: [
      {
        pregunta:
          'Una tabla estudiantes tiene 5 columnas y 20 filas. Si ejecutas SELECT * FROM estudiantes;, ¿cuántas columnas y filas devuelve?',
        opciones: [
          '5 columnas y 20 filas',
          '1 columna y 20 filas',
          '5 columnas y 1 fila',
          '20 columnas y 5 filas',
        ],
        indiceCorrecto: 0,
        explicacion:
          'El comodín * mantiene las 5 columnas y, sin WHERE, se conservan las 20 filas completas.',
      },
      {
        pregunta: '¿Qué orden de ejecución sigue el motor SQL en SELECT * FROM libros;?',
        opciones: [
          'Primero SELECT y luego FROM',
          'Primero FROM (localiza la tabla) y luego SELECT (proyecta columnas)',
          'No importa el orden, es simultáneo',
          'Primero WHERE y luego FROM',
        ],
        indiceCorrecto: 1,
        explicacion:
          'El motor ubica la tabla con FROM y después proyecta con SELECT. Nunca al revés.',
      },
      {
        pregunta: '¿Qué hace el asterisco * en la consulta?',
        opciones: [
          'Cuenta las filas',
          'Selecciona todas las columnas de la tabla',
          'Borra las tablas',
          'Ordena los datos',
        ],
        indiceCorrecto: 1,
        explicacion: 'El comodín * significa "todas las columnas" del esquema de la tabla.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 2,
    codigo: 'SQL-02',
    titulo: 'Sentencia SELECT Básica',
    tema: 'Proyección restringida de columnas',
    temaGrafico: 'proyectar',
    objetivoClaro:
      'Escribe la consulta que devuelva SOLO las columnas nombre y precio de la tabla productos: SELECT nombre, precio FROM productos;',
    contexto:
      'La Farmacia "Vida Sana" imprimirá una cartela de precios para el público. Por privacidad NO pueden aparecer ni el costo del proveedor ni si requiere receta médica.',
    nivelConceptual:
      'Pedir siempre * es cómodo pero peligroso en producción: gasta memoria, baja el rendimiento y expone datos privados. Así como un cajero solo necesita tu nombre y tu fotografía (y no tu historial médico), la consulta debe pedir únicamente lo necesario. A eso se le llama Proyección Restringida.',
    nivelLogico:
      '1) FROM productos carga la estructura de la tabla. 2) SELECT nombre, precio descarta de la salida las columnas no listadas (id_producto, costo_proveedor, receta_medica). El resto de filas se conserva.',
    nivelSintactico:
      'SELECT nombre, precio FROM productos;\n\n- Los nombres de columnas se separan con coma (,).\n- NO se pone coma después de la última columna antes del FROM.\n- Las columnas no listadas quedan fuera del resultado.',
    ejemploSql: 'SELECT nombre, precio FROM productos;',
    tablas: [
      {
        nombre: 'productos',
        descripcion: 'Inventario de la Farmacia "Vida Sana".',
        columnas: [
          { nombre: 'id_producto', tipo: 'INTEGER' },
          { nombre: 'nombre', tipo: 'VARCHAR' },
          { nombre: 'costo_proveedor', tipo: 'DECIMAL' },
          { nombre: 'precio', tipo: 'DECIMAL' },
          { nombre: 'receta_medica', tipo: 'BOOLEAN' },
        ],
        filas: [
          {
            id_producto: 1,
            nombre: 'Jarabe infantil',
            costo_proveedor: 2.5,
            precio: 4.9,
            receta_medica: false,
          },
          {
            id_producto: 2,
            nombre: 'Vitamina C',
            costo_proveedor: 3.2,
            precio: 6.8,
            receta_medica: false,
          },
          {
            id_producto: 3,
            nombre: 'Crema hidratante',
            costo_proveedor: 5.0,
            precio: 9.5,
            receta_medica: false,
          },
        ],
      },
    ],
    consultaCorrecta: 'SELECT nombre, precio FROM productos;',
    clavesValidacion: ['select nombre, precio', 'from productos'],
    resultadoColumnas: ['nombre', 'precio'],
    resultadoFilas: [
      { nombre: 'Jarabe infantil', precio: 4.9 },
      { nombre: 'Vitamina C', precio: 6.8 },
      { nombre: 'Crema hidratante', precio: 9.5 },
    ],
    preguntaRazonamiento:
      'Antes de escribir código: para NO exponer el costo_proveedor ni receta_medica, ¿qué estrategia debes aplicar en la lista del SELECT?',
    opcionesPrediccion: [
      'Listar solo nombre y precio',
      'Usar * para esconder los datos privados',
      'Usar WHERE para borrar columnas',
      'SELECT evitar privacidad FROM productos',
    ],
    indicePrediccionCorrecta: 0,
    pistas: [
      'Evita el comodín * y enumera únicamente los atributos requeridos.',
      'Escribe SELECT seguido del primer campo, una coma y el segundo campo.',
      'Los campos que puedes mostrar son nombre y precio.',
      'Solución completa: SELECT nombre, precio FROM productos;',
    ],
    retroalimentacionError:
      'La consulta no entrega exactamente la cartela pública. Comprueba que pidas SOLO nombre y precio, en ese orden, separados por coma y sin coma antes del FROM.',
    resolucionComentada:
      'SELECT nombre, precio FROM productos; — proyección restringida: de las 5 columnas solo salen 2, y todas las filas se conservan.',
    preguntasDiagnostico: [
      {
        pregunta:
          'Una tabla empleados tiene 5 campos. ¿Cuántas columnas devuelve SELECT nombre, salario FROM empleados;?',
        opciones: ['5 columnas', '2 columnas', '1 columna', '0 columnas'],
        indiceCorrecto: 1,
        explicacion:
          'Solo se proyectan las 2 columnas listadas en el SELECT; las otras 3 se descartan.',
      },
      {
        pregunta: '¿Qué signo separa las columnas dentro de la lista del SELECT?',
        opciones: ['El punto y coma', 'La coma', 'Un espacio en blanco', 'La barra vertical |'],
        indiceCorrecto: 1,
        explicacion:
          'Las columnas se separan con coma (,). El punto y coma solo cierra la sentencia.',
      },
      {
        pregunta: '¿Qué problema resuelve la proyección restringida?',
        opciones: [
          'Acelera el disco duro',
          'Evita exponer datos privados y reduce el consumo de recursos',
          'Hace las tablas más grandes',
          'Elimina filas duplicadas',
        ],
        indiceCorrecto: 1,
        explicacion:
          'Pedir solo lo necesario protege información sensible y mejora el rendimiento.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 3,
    codigo: 'SQL-03',
    titulo: 'Filtros con WHERE',
    tema: 'Filtrado de filas con condiciones',
    temaGrafico: 'filtrar',
    objetivoClaro:
      'Escribe la consulta que devuelva todas las columnas de facturas pero SOLO las filas cuyo estado sea "Pendiente": SELECT * FROM facturas WHERE estado = \'Pendiente\';',
    contexto:
      'El taller "Automotriz Exprés" necesita el reporte de las facturas que todavía no han sido pagadas para pasar el cobro a los clientes.',
    nivelConceptual:
      'El filtrado es como una aduana o un tamiz: cada fila pasa por la condición y solo se aprueba si la condición es VERDADERA (TRUE). El taller solo interviene las facturas morosas; las pagadas y anuladas no pasan.',
    nivelLogico:
      "1) FROM facturas abre la fuente de datos. 2) WHERE estado = 'Pendiente' evalúa fila por fila: si la condición es TRUE la conserva; si es FALSE o NULL la descarta. 3) SELECT * proyecta las filas que superaron el filtro.",
    nivelSintactico:
      "SELECT * FROM facturas WHERE estado = 'Pendiente';\n\n- Los textos y fechas van ENTRE COMILLAS SIMPLES ('Pendiente').\n- Los números NO llevan comillas (monto_total > 500).\n- El operador de igualdad es un solo signo =.",
    ejemploSql: "SELECT * FROM facturas WHERE estado = 'Pendiente';",
    tablas: [
      {
        nombre: 'facturas',
        descripcion: 'Facturas emitidas por el taller.',
        columnas: [
          { nombre: 'id_factura', tipo: 'INTEGER' },
          { nombre: 'cliente', tipo: 'VARCHAR' },
          { nombre: 'monto_total', tipo: 'DECIMAL' },
          { nombre: 'estado', tipo: 'VARCHAR' },
        ],
        filas: [
          { id_factura: 1, cliente: 'Elena Ruiz', monto_total: 1250.0, estado: 'Pendiente' },
          { id_factura: 2, cliente: 'Marco Díaz', monto_total: 800.5, estado: 'Pagada' },
          { id_factura: 3, cliente: 'Lucía Paz', monto_total: 3400.0, estado: 'Pendiente' },
          { id_factura: 4, cliente: 'Tomás Gil', monto_total: 90.0, estado: 'Anulada' },
        ],
      },
    ],
    consultaCorrecta: "SELECT * FROM facturas WHERE estado = 'Pendiente';",
    clavesValidacion: ['select', 'from facturas', 'where', "estado = 'pendiente'"],
    resultadoColumnas: ['id_factura', 'cliente', 'monto_total', 'estado'],
    resultadoFilas: [
      { id_factura: 1, cliente: 'Elena Ruiz', monto_total: 1250.0, estado: 'Pendiente' },
      { id_factura: 3, cliente: 'Lucía Paz', monto_total: 3400.0, estado: 'Pendiente' },
    ],
    preguntaRazonamiento:
      'Antes de escribir código: ¿qué cláusula de SQL permite condicionar o filtrar las filas de una tabla?',
    opcionesPrediccion: ['ORDER BY', 'WHERE', 'GROUP BY', 'HAVING'],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Quieres descartar las facturas saldadas o anuladas y quedarte solo con las morosas.',
      'Agrega la condición al final de la consulta SELECT * FROM facturas.',
      "La palabra 'Pendiente' es texto y debe ir entre comillas simples.",
      "Solución completa: SELECT * FROM facturas WHERE estado = 'Pendiente';",
    ],
    retroalimentacionError:
      'El reporte aún muestra filas equivocadas. Revisa que uses WHERE, que compares con = (un solo signo) y que el texto Pendiente esté entre comillas simples.',
    resolucionComentada:
      "SELECT * FROM facturas WHERE estado = 'Pendiente'; — solo pasan las filas 1 y 3; la 2 (Pagada) y la 4 (Anulada) quedan fuera.",
    preguntasDiagnostico: [
      {
        pregunta:
          'Si un producto tiene existencias = 10, ¿aparecerá al ejecutar SELECT * FROM inventario WHERE existencias < 10;?',
        opciones: [
          'Sí, porque 10 es igual a 10',
          'No, porque < es estrictamente menor y no incluye el 10',
          'Ocurrirá un error de sintaxis',
          'Sí, pero solo a medias',
        ],
        indiceCorrecto: 1,
        explicacion: '10 < 10 es FALSO. Para incluirlo haría falta el operador <=.',
      },
      {
        pregunta: '¿Cómo debes escribir un texto como Pendiente dentro del WHERE?',
        opciones: [
          "Entre comillas simples: 'Pendiente'",
          'Entre comillas dobles: \"Pendiente\"',
          'Sin comillas',
          'Entre paréntesis',
        ],
        indiceCorrecto: 0,
        explicacion: 'Las cadenas de texto en SQL se delimitan con comillas simples.',
      },
      {
        pregunta: '¿Cuál es el operador de igualdad correcto en SQL?',
        opciones: ['==', '=', '===', '<> para igualdad'],
        indiceCorrecto: 1,
        explicacion: 'SQL usa un solo signo = para comparar igualdad. == no existe en SQL.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 4,
    codigo: 'SQL-04',
    titulo: 'Ordenamiento y Límites',
    tema: 'ORDER BY + LIMIT (TOP N)',
    temaGrafico: 'ordenar',
    objetivoClaro:
      'Escribe la consulta que devuelva nombre y puntaje de los 3 jugadores con MÁS puntos, ordenados de mayor a menor: SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3;',
    contexto:
      'El videojuego "CyberArena" quiere publicar en pantalla el TABLÓN DE HONOR con el TOP 3 de las puntuaciones más altas.',
    nivelConceptual:
      'En una base de datos las filas no tienen orden garantizado; el orden lo decide el motor. Así como en una competición ordenas a todos los corredores por tiempo y luego recortas a los 3 primeros, en SQL piensa en dos pasos: ORDENAR todo y después RECORTAR con LIMIT.',
    nivelLogico:
      '1) FROM jugadores carga el universo de usuarios. 2) SELECT nombre, puntaje proyecta las columnas. 3) ORDER BY puntaje DESC aplica un algoritmo de ordenamiento de mayor a menor. 4) LIMIT 3 corta el envío de filas al llegar a 3.',
    nivelSintactico:
      'SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3;\n\n- ASC: de menor a mayor (por defecto).\n- DESC: de mayor a menor.\n- LIMIT n: máx. n filas. LIMIT va SIEMPRE al final.',
    ejemploSql: 'SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3;',
    tablas: [
      {
        nombre: 'jugadores',
        descripcion: 'Ranking de jugadores de CyberArena.',
        columnas: [
          { nombre: 'id_jugador', tipo: 'INTEGER' },
          { nombre: 'nombre', tipo: 'VARCHAR' },
          { nombre: 'nivel', tipo: 'INTEGER' },
          { nombre: 'puntaje', tipo: 'INTEGER' },
        ],
        filas: [
          { id_jugador: 1, nombre: 'Nova', nivel: 3, puntaje: 1200 },
          { id_jugador: 2, nombre: 'Blitz', nivel: 5, puntaje: 3400 },
          { id_jugador: 3, nombre: 'Pixel', nivel: 2, puntaje: 800 },
          { id_jugador: 4, nombre: 'Zeta', nivel: 4, puntaje: 2500 },
          { id_jugador: 5, nombre: 'Cipher', nivel: 1, puntaje: 450 },
        ],
      },
    ],
    consultaCorrecta: 'SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3;',
    clavesValidacion: [
      'select nombre, puntaje',
      'from jugadores',
      'order by puntaje desc',
      'limit 3',
    ],
    resultadoColumnas: ['nombre', 'puntaje'],
    resultadoFilas: [
      { nombre: 'Blitz', puntaje: 3400 },
      { nombre: 'Zeta', puntaje: 2500 },
      { nombre: 'Nova', puntaje: 1200 },
    ],
    preguntaRazonamiento:
      'Si ejecutas SELECT producto, precio FROM tienda ORDER BY precio ASC LIMIT 1;, ¿qué fila obtienes?',
    opcionesPrediccion: [
      'El producto más caro',
      'El producto más barato',
      'Una muestra aleatoria',
      'Un error porque falta WHERE',
    ],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Necesitas dos operaciones en secuencia: ordenar de mayor a menor y cortar la lista en la tercera fila.',
      'Combina ORDER BY con el modificador DESC y finaliza con LIMIT.',
      'Debes escribir ORDER BY puntaje DESC y terminar la consulta con LIMIT 3.',
      'Solución completa: SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3;',
    ],
    retroalimentacionError:
      'El tablón no muestra el TOP 3 correcto. Revisa el orden DESC (mayor a menor) y que LIMIT 3 sea la última instrucción.',
    resolucionComentada:
      'SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3; — Blitz (3400), Zeta (2500) y Nova (1200).',
    preguntasDiagnostico: [
      {
        pregunta: 'Si usas ORDER BY puntaje ASC LIMIT 3, ¿qué jugadores aparecen?',
        opciones: [
          'Los 3 de mayor puntaje',
          'Los 3 de menor puntaje',
          'Los 3 del nivel más alto',
          'Los primeros insertados',
        ],
        indiceCorrecto: 1,
        explicacion:
          'ASC ordena de menor a mayor, así que LIMIT 3 toma los tres puntajes más bajos.',
      },
      {
        pregunta: '¿Cuál es el orden correcto de las cláusulas?',
        opciones: [
          'LIMIT 3 ORDER BY puntaje DESC',
          'ORDER BY puntaje DESC LIMIT 3',
          'WHERE ...  LIMIT ...  ORDER BY',
          'ORDER BY ...  WHERE ...  LIMIT',
        ],
        indiceCorrecto: 1,
        explicacion:
          'El orden lógico es FROM → WHERE → SELECT → ORDER BY → LIMIT. LIMIT siempre encabeza el final.',
      },
      {
        pregunta: '¿Qué hace DESC en ORDER BY?',
        opciones: [
          'Ordena de mayor a menor',
          'Ordena de menor a mayor',
          'Elimina duplicados',
          'Limita las filas',
        ],
        indiceCorrecto: 0,
        explicacion: 'DESC es descendente (mayor a menor); ASC es ascendente (menor a mayor).',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 5,
    codigo: 'SQL-05',
    titulo: 'Funciones de Agregación',
    tema: 'SUM / COUNT / AVG (un solo valor)',
    temaGrafico: 'agregar',
    objetivoClaro:
      'Escribe la consulta que calcule el TOTAL del dinero del inventario sumando la columna precio: SELECT SUM(precio) FROM inventario;',
    contexto:
      'El departamento financiero del supermercado "El Globo" quiere saber, de un solo golpe, cuánto dinero representa el inventario actual en mercancía.',
    nivelConceptual:
      'Las funciones de agregación convierten MUCHAS filas en UN solo valor escalar. Así como el dueño de una tienda no revisa 500 tickets sino que pregunta "¿cuánto cayó hoy a la caja?", SUM consolida toda una columna.',
    nivelLogico:
      'COUNT(columna) cuenta los valores no nulos; COUNT(*) cuenta las filas. SUM suma valores numéricos. AVG promedia. MIN/MAX hallan el mínimo/máximo. Todas ignoran los NULL (salvo COUNT(*)).',
    nivelSintactico:
      'SELECT SUM(precio) FROM inventario;\n\n- La función va en el SELECT y su columna entre paréntesis.\n- NO puedes mezclar una columna ordinaria con una agregación sin GROUP BY.',
    ejemploSql: 'SELECT SUM(precio) FROM inventario;',
    tablas: [
      {
        nombre: 'inventario',
        descripcion: 'Mercancía actual del supermercado.',
        columnas: [
          { nombre: 'id_producto', tipo: 'INTEGER' },
          { nombre: 'nombre_producto', tipo: 'VARCHAR' },
          { nombre: 'categoria', tipo: 'VARCHAR' },
          { nombre: 'precio', tipo: 'DECIMAL' },
        ],
        filas: [
          {
            id_producto: 1,
            nombre_producto: 'Disco SSD',
            categoria: 'Almacenamiento',
            precio: 2500.0,
          },
          {
            id_producto: 2,
            nombre_producto: 'Memoria RAM',
            categoria: 'Componentes',
            precio: 1800.0,
          },
          {
            id_producto: 3,
            nombre_producto: 'Monitor 24"',
            categoria: 'Pantallas',
            precio: 3200.0,
          },
          {
            id_producto: 4,
            nombre_producto: 'Teclado mecánico',
            categoria: 'Periféricos',
            precio: 950.0,
          },
        ],
      },
    ],
    consultaCorrecta: 'SELECT SUM(precio) FROM inventario;',
    clavesValidacion: ['select sum(precio)', 'from inventario'],
    resultadoColumnas: ['sum'],
    resultadoFilas: [{ sum: 8450.0 }],
    preguntaRazonamiento:
      'Antes de escribir código: para convertir todas las filas de precio en un único total acumulado, ¿qué función de agregación usas?',
    opcionesPrediccion: ['COUNT(precio)', 'SUM(precio)', 'AVG(precio)', 'GROUP BY(precio)'],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Necesitas reducir las múltiples filas de la columna a un único valor acumulado.',
      'Para adición y acumulación monetaria la función adecuada es SUM.',
      'Encierra la columna entre paréntesis: SUM(precio).',
      'Solución completa: SELECT SUM(precio) FROM inventario;',
    ],
    retroalimentacionError:
      'No obtuviste el total monetario. Revisa que uses SUM (no COUNT), que la columna sea precio y que vaya entre paréntesis.',
    resolucionComentada: 'SELECT SUM(precio) FROM inventario; — 2500 + 1800 + 3200 + 950 = 8450.00',
    preguntasDiagnostico: [
      {
        pregunta:
          'Una tabla tiene 10 filas y en comision hay 3 NULL y 7 números. ¿Qué devuelve SELECT COUNT(comision) FROM empleados;?',
        opciones: ['10', '7', 'NULL', '0'],
        indiceCorrecto: 1,
        explicacion:
          'Las agregaciones ignoran NULL (solo COUNT(*) cuenta todo). Por eso devuelve 7.',
      },
      {
        pregunta:
          '¿Cuál es el resultado de SELECT SUM(precio) FROM inventario; con precios 2500, 1800, 3200 y 950?',
        opciones: ['8450', '4', '2500', '3200'],
        indiceCorrecto: 0,
        explicacion: 'La suma acumulada de los cuatro precios es 8450.',
      },
      {
        pregunta: '¿Por qué SELECT nombre_producto, SUM(precio) FROM inventario; es un error?',
        opciones: [
          'Falta GROUP BY, no puedes mezclar una columna ordinaria con una agregación',
          'SUM no existe',
          'nombre_producto es muy largo',
          'Falta LIMIT',
        ],
        indiceCorrecto: 0,
        explicacion:
          'Una columna ordinaria junto a una agregación exige GROUP BY para saber cómo agrupar.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 6,
    codigo: 'SQL-06',
    titulo: 'Agrupamiento con GROUP BY',
    tema: 'Agregar por grupos + HAVING',
    temaGrafico: 'agrupar',
    objetivoClaro:
      'Escribe la consulta que cuente empleados por departamento y muestre SOLO los departamentos con MÁS de 4 empleados: SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4;',
    contexto:
      'Recursos Humanos necesita el censo de personal por departamento, pero solo le interesan los departamentos con más de 4 trabajadores para priorizar contrataciones.',
    nivelConceptual:
      'GROUP BY divide las filas en grupos según un valor común (como separar pelotas rojas, azules y verdes en cubos) y aplica la función de agregación a cada cubo por separado. WHERE filtra filas ANTES de agrupar; HAVING filtra grupos completos DESPUÉS de agrupar.',
    nivelLogico:
      '1) FROM empleados carga las filas. 2) WHERE activo = TRUE filtra filas individuales. 3) GROUP BY departamento forma los cubos. 4) HAVING COUNT(*) > 4 descarta los cubos con 4 o menos. 5) SELECT proyecta los grupos aprobados.',
    nivelSintactico:
      'SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4;\n\n- Regla de oro: toda columna del SELECT que no sea agregación debe estar en GROUP BY.\n- HAVING evalúa funciones agregadas; WHERE no puede.',
    ejemploSql:
      'SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4;',
    tablas: [
      {
        nombre: 'empleados',
        descripcion: 'Plantilla completa de la empresa.',
        columnas: [
          { nombre: 'id_empleado', tipo: 'INTEGER' },
          { nombre: 'nombre', tipo: 'VARCHAR' },
          { nombre: 'departamento', tipo: 'VARCHAR' },
          { nombre: 'salario', tipo: 'DECIMAL' },
        ],
        filas: [
          { id_empleado: 1, nombre: 'Ana', departamento: 'Ventas', salario: 3000.0 },
          { id_empleado: 2, nombre: 'Luis', departamento: 'Ventas', salario: 3200.0 },
          { id_empleado: 3, nombre: 'Sofía', departamento: 'Ventas', salario: 2900.0 },
          { id_empleado: 4, nombre: 'Iván', departamento: 'Ventas', salario: 3400.0 },
          { id_empleado: 5, nombre: 'María', departamento: 'Ventas', salario: 3100.0 },
          { id_empleado: 6, nombre: 'Pedro', departamento: 'Soporte', salario: 2600.0 },
          { id_empleado: 7, nombre: 'Rosa', departamento: 'Soporte', salario: 2700.0 },
          { id_empleado: 8, nombre: 'Tomas', departamento: 'Soporte', salario: 2500.0 },
          { id_empleado: 9, nombre: 'Julia', departamento: 'Desarrollo', salario: 3800.0 },
          { id_empleado: 10, nombre: 'Diego', departamento: 'Desarrollo', salario: 4000.0 },
          { id_empleado: 11, nombre: 'Elena', departamento: 'Desarrollo', salario: 3600.0 },
          { id_empleado: 12, nombre: 'Carla', departamento: 'Desarrollo', salario: 4200.0 },
          { id_empleado: 13, nombre: 'Marcos', departamento: 'Desarrollo', salario: 3700.0 },
          { id_empleado: 14, nombre: 'Nora', departamento: 'Desarrollo', salario: 3900.0 },
          { id_empleado: 15, nombre: 'Omar', departamento: 'RH', salario: 2300.0 },
          { id_empleado: 16, nombre: 'Pilar', departamento: 'RH', salario: 2400.0 },
        ],
      },
    ],
    consultaCorrecta:
      'SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4;',
    clavesValidacion: [
      'select departamento',
      'count(*)',
      'from empleados',
      'group by departamento',
      'having count(*) > 4',
    ],
    resultadoColumnas: ['departamento', 'count'],
    resultadoFilas: [
      { departamento: 'Desarrollo', count: 6 },
      { departamento: 'Ventas', count: 5 },
    ],
    preguntaRazonamiento:
      '¿Por qué falla SELECT departamento, AVG(salario) FROM empleados WHERE AVG(salario) > 3000 GROUP BY departamento;?',
    opcionesPrediccion: [
      'AVG solo acepta enteros',
      'Usa WHERE para filtrar una función agregada; necesita HAVING',
      'GROUP BY debe ir antes de WHERE',
      'Falta LIMIT',
    ],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Clasifica a los empleados por departamento y cuenta los integrantes de cada grupo.',
      'Usa GROUP BY departamento y después filtra los grupos con HAVING.',
      'En el SELECT pide departamento y COUNT(*), y al final escribe HAVING COUNT(*) > 4.',
      'Solución completa: SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4;',
    ],
    retroalimentacionError:
      'El censo no muestra solo los departamentos grandes. Verifica GROUP BY departamento y que el filtro del grupo sea HAVING COUNT(*) > 4 (no WHERE).',
    resolucionComentada:
      'SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4; — Desarrollo (6) y Ventas (5) pasan; Soporte (3) y RH (2) quedan fuera.',
    preguntasDiagnostico: [
      {
        pregunta: '¿Qué cláusula filtra grupos completos DESPUÉS de agrupar?',
        opciones: ['WHERE', 'HAVING', 'LIMIT', 'ORDER BY'],
        indiceCorrecto: 1,
        explicacion: 'WHERE filtra filas antes de agrupar; HAVING evalúa los grupos ya formados.',
      },
      {
        pregunta: '¿Qué regla de oro impone GROUP BY?',
        opciones: [
          'Toda columna del SELECT que no sea agregación debe estar en GROUP BY',
          'GROUP BY va después de HAVING',
          'Solo puede haber una fila',
          'No se puede usar COUNT',
        ],
        indiceCorrecto: 0,
        explicacion:
          'Si una columna no es función de agregación y aparece en el SELECT, debe estar en GROUP BY.',
      },
      {
        pregunta: 'En HAVING COUNT(*) > 4, ¿qué se evalúa?',
        opciones: [
          'El conteo de cada grupo formado',
          'El total de todas las filas',
          'El promedio general',
          'El primer registro',
        ],
        indiceCorrecto: 0,
        explicacion: 'HAVING evalúa la agregación por grupo: solo pasan los grupos con más de 4.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 7,
    codigo: 'SQL-07',
    titulo: 'Uniones con INNER JOIN',
    tema: 'Combinar dos tablas por llaves',
    temaGrafico: 'unir',
    objetivoClaro:
      'Escribe la consulta que una estudiantes con cursos mostrando nombre del estudiante y nombre del curso: SELECT estudiantes.nombre, cursos.nombre_curso FROM estudiantes INNER JOIN cursos ON estudiantes.curso_id = cursos.id;',
    contexto:
      '"Academia Digital" necesita el listado oficial de inscripciones: cada estudiante con el nombre del curso asignado, sin incluir a quien aún no tiene curso.',
    nivelConceptual:
      'Para evitar repetir información, una base de datos reparte los datos en tablas conectadas por llaves. estudiantes guarda una Llave Foránea (curso_id) que apunta a la Llave Primaria de cursos (id). INNER JOIN une las filas donde ambas coinciden, como un conector que encaja dos piezas.',
    nivelLogico:
      '1) Se forma un producto cartesiano implícito (cada fila de estudiantes con todas las de cursos). 2) El predicado ON estudiantes.curso_id = cursos.id conserva solo los pares con igualdad verdadera. Las filas sin coincidencia se descartan.',
    nivelSintactico:
      'SELECT estudiantes.nombre, cursos.nombre_curso FROM estudiantes INNER JOIN cursos ON estudiantes.curso_id = cursos.id;\n\n- Prefija las columnas con su tabla para evitar ambigüedad (estudiantes.nombre).\n- La condición de unión se escribe con ON, no con WHERE.',
    ejemploSql:
      'SELECT estudiantes.nombre, cursos.nombre_curso FROM estudiantes INNER JOIN cursos ON estudiantes.curso_id = cursos.id;',
    tablas: [
      {
        nombre: 'estudiantes',
        descripcion: 'Matrícula de alumnos.',
        columnas: [
          { nombre: 'id', tipo: 'INTEGER' },
          { nombre: 'nombre', tipo: 'VARCHAR' },
          { nombre: 'curso_id', tipo: 'INTEGER' },
        ],
        filas: [
          { id: 1, nombre: 'Ana', curso_id: 2 },
          { id: 2, nombre: 'Luis', curso_id: 1 },
          { id: 3, nombre: 'Sofía', curso_id: 2 },
          { id: 4, nombre: 'Iván', curso_id: null },
          { id: 5, nombre: 'María', curso_id: 3 },
        ],
      },
      {
        nombre: 'cursos',
        descripcion: 'Catálogo de cursos.',
        columnas: [
          { nombre: 'id', tipo: 'INTEGER' },
          { nombre: 'nombre_curso', tipo: 'VARCHAR' },
          { nombre: 'creditos', tipo: 'INTEGER' },
        ],
        filas: [
          { id: 1, nombre_curso: 'SQL Relacional', creditos: 4 },
          { id: 2, nombre_curso: 'HTML Semántico', creditos: 3 },
          { id: 3, nombre_curso: 'CSS Avanzado', creditos: 4 },
        ],
      },
    ],
    consultaCorrecta:
      'SELECT estudiantes.nombre, cursos.nombre_curso FROM estudiantes INNER JOIN cursos ON estudiantes.curso_id = cursos.id;',
    clavesValidacion: [
      'select estudiantes.nombre, cursos.nombre_curso',
      'from estudiantes inner join cursos',
      'on estudiantes.curso_id = cursos.id',
    ],
    resultadoColumnas: ['nombre', 'nombre_curso'],
    resultadoFilas: [
      { nombre: 'Ana', nombre_curso: 'HTML Semántico' },
      { nombre: 'Luis', nombre_curso: 'SQL Relacional' },
      { nombre: 'Sofía', nombre_curso: 'HTML Semántico' },
      { nombre: 'María', nombre_curso: 'CSS Avanzado' },
    ],
    preguntaRazonamiento:
      'Si un estudiante tiene curso_id = NULL, ¿aparecerá en el resultado de un INNER JOIN hacia cursos?',
    opcionesPrediccion: [
      'Sí, con el curso en NULL',
      'No, INNER JOIN descarta las filas sin coincidencia exacta',
      'Sí, se asocia al primer curso',
      'Sí, con el curso por defecto',
    ],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Estás cruzando dos tablas diferentes para conectar cada estudiante con su curso.',
      'Pon estudiantes en FROM, agrega INNER JOIN cursos y conecta las llaves con ON.',
      'La igualdad que une las llaves es: estudiantes.curso_id = cursos.id.',
      'Solución completa: SELECT estudiantes.nombre, cursos.nombre_curso FROM estudiantes INNER JOIN cursos ON estudiantes.curso_id = cursos.id;',
    ],
    retroalimentacionError:
      'Falta completar la unión. Verifica el INNER JOIN cursos, la relación ON y que prefijes las columnas con su tabla.',
    resolucionComentada:
      'La unión cruza las 5 filas de estudiantes con las 3 de cursos, pero ON descarta a Iván (curso_id NULL). Resultado: 4 filas.',
    preguntasDiagnostico: [
      {
        pregunta: '¿Qué hace INNER JOIN con las filas sin coincidencia exacta?',
        opciones: ['Las conserva con NULL', 'Las descarta', 'Las duplica', 'Las ordena al final'],
        indiceCorrecto: 1,
        explicacion: 'INNER JOIN es la intersección estricta: solo permanecen las coincidencias.',
      },
      {
        pregunta: '¿Dónde se define la condición de unión?',
        opciones: [
          'En la cláusula ON',
          'En la cláusula LIMIT',
          'En la lista del SELECT',
          'En ORDER BY',
        ],
        indiceCorrecto: 0,
        explicacion: 'La condición que conecta las llaves se declara con ON, no con WHERE.',
      },
      {
        pregunta: '¿Por qué se escribe estudiantes.nombre en lugar de solo nombre?',
        opciones: [
          'Porque es más largo y bonito',
          'Para evitar ambigüedad si la columna existe en ambas tablas',
          'Porque el SQL lo exige siempre',
          'No se puede prefijar',
        ],
        indiceCorrecto: 1,
        explicacion: 'Prefijar con el nombre de la tabla evita columnas ambiguas en el JOIN.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 8,
    codigo: 'SQL-08',
    titulo: 'Uniones Externas (LEFT / RIGHT JOIN)',
    tema: 'Preservar filas sin coincidencia',
    temaGrafico: 'preservar',
    objetivoClaro:
      'Escribe la consulta que muestre TODOS los vendedores (aunque no tengan ventas) con su id de venta: SELECT vendedores.nombre, ventas.id FROM vendedores LEFT JOIN ventas ON vendedores.id = ventas.vendedor_id;',
    contexto:
      'El director comercial de la concesionaria "AutoMotor" pide el informe de TODOS los vendedores con su identificador de venta. Los vendedores sin ventas deben aparecer igualmente.',
    nivelConceptual:
      'Las uniones externas (LEFT/RIGHT JOIN) conservan la totalidad de las filas de una tabla dominante y rellenan con NULL los campos de la tabla que no encontró coincidencia. Es como un listado de asistencia donde no quieres borrar al vendedor que aún no vendió: aparece con un hueco (NULL).',
    nivelLogico:
      '1) En LEFT JOIN, la TablaA (izquierda del comando) es dominante. 2) Se evalúan coincidencias en la TablaB. 3) Si hay coincidencia se combinan los datos. 4) Si NO hay, la fila de A se conserva y los campos de B se rellenan con NULL.',
    nivelSintactico:
      'SELECT vendedores.nombre, ventas.id FROM vendedores LEFT JOIN ventas ON vendedores.id = ventas.vendedor_id;\n\n- LEFT JOIN: conserva todas las filas de la tabla izquierda.\n- RIGHT JOIN: conserva todas las filas de la tabla derecha.',
    ejemploSql:
      'SELECT vendedores.nombre, ventas.id FROM vendedores LEFT JOIN ventas ON vendedores.id = ventas.vendedor_id;',
    tablas: [
      {
        nombre: 'vendedores',
        descripcion: 'Plantilla del equipo comercial.',
        columnas: [
          { nombre: 'id', tipo: 'INTEGER' },
          { nombre: 'nombre', tipo: 'VARCHAR' },
          { nombre: 'sucursal', tipo: 'VARCHAR' },
        ],
        filas: [
          { id: 1, nombre: 'Carlos', sucursal: 'Norte' },
          { id: 2, nombre: 'Marta', sucursal: 'Sur' },
          { id: 3, nombre: 'Jorge', sucursal: 'Centro' },
          { id: 4, nombre: 'Lucía', sucursal: 'Norte' },
        ],
      },
      {
        nombre: 'ventas',
        descripcion: 'Transacciones registradas.',
        columnas: [
          { nombre: 'id', tipo: 'INTEGER' },
          { nombre: 'vendedor_id', tipo: 'INTEGER' },
          { nombre: 'monto', tipo: 'DECIMAL' },
        ],
        filas: [
          { id: 10, vendedor_id: 1, monto: 1500.0 },
          { id: 11, vendedor_id: 2, monto: 2200.0 },
          { id: 12, vendedor_id: 3, monto: 800.0 },
        ],
      },
    ],
    consultaCorrecta:
      'SELECT vendedores.nombre, ventas.id FROM vendedores LEFT JOIN ventas ON vendedores.id = ventas.vendedor_id;',
    clavesValidacion: [
      'select vendedores.nombre, ventas.id',
      'from vendedores left join ventas',
      'on vendedores.id = ventas.vendedor_id',
    ],
    resultadoColumnas: ['nombre', 'id'],
    resultadoFilas: [
      { nombre: 'Carlos', id: 10 },
      { nombre: 'Marta', id: 11 },
      { nombre: 'Jorge', id: 12 },
      { nombre: 'Lucía', id: null },
    ],
    preguntaRazonamiento:
      'Si "Carlos" no hubiera hecho ventas y ejecutas un LEFT JOIN, ¿qué valor aparece en ventas.monto para Carlos?',
    opcionesPrediccion: ['0', 'NULL', 'Su fila no aparecerá', 'El monto mínimo'],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Si usas INNER JOIN, los vendedores sin ventas se eliminan. Necesitas una unión externa.',
      'Sitúa vendedores en FROM y conéctala a ventas mediante LEFT JOIN.',
      'La condición ON debe comparar vendedores.id = ventas.vendedor_id.',
      'Solución completa: SELECT vendedores.nombre, ventas.id FROM vendedores LEFT JOIN ventas ON vendedores.id = ventas.vendedor_id;',
    ],
    retroalimentacionError:
      'El informe no preserva a todos los vendedores. Confirma que uses LEFT JOIN con vendedores como tabla izquierda (FROM) y el ON con las llaves correctas.',
    resolucionComentada:
      'LEFT JOIN conserva a los 4 vendedores; Lucía no tiene ventas, así que ventas.id = NULL.',
    preguntasDiagnostico: [
      {
        pregunta: '¿Qué filas garantiza conservar un LEFT JOIN?',
        opciones: [
          'Todas las de la tabla derecha',
          'Todas las de la tabla izquierda',
          'Solo las coincidencias',
          'Ninguna',
        ],
        indiceCorrecto: 1,
        explicacion:
          'LEFT JOIN preserva la totalidad de filas de la tabla izquierda y rellena con NULL lo no coincidente.',
      },
      {
        pregunta: '¿Qué valor recibe el campo de la tabla derecha cuando NO hay coincidencia?',
        opciones: ['0', 'NULL', 'Cadena vacía', 'Se elimina la fila'],
        indiceCorrecto: 1,
        explicacion:
          'Las filas sin coincidencia se completan con NULL en los campos de la tabla no dominante.',
      },
      {
        pregunta: '¿Cuál es la diferencia entre INNER JOIN y LEFT JOIN?',
        opciones: [
          'Ninguna, son iguales',
          'INNER solo conserva coincidencias; LEFT además conserva las filas a la izquierda',
          'LEFT solo conserva coincidencias',
          'INNER conserva todas las filas',
        ],
        indiceCorrecto: 1,
        explicacion:
          'INNER es intersección estricta; LEFT agrega las filas de la izquierda sin pareja.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 9,
    codigo: 'SQL-09',
    titulo: 'Subconsultas y CTEs',
    tema: 'Consulta anidada con agregación',
    temaGrafico: 'subconsulta',
    objetivoClaro:
      'Escribe una consulta anidada que muestre nombre y salario de los empleados que ganan MÁS que el promedio de la empresa: SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados);',
    contexto:
      'La empresa "Innovación Tecnológica" entregará un bono especial a los trabajadores que ganan estrictamente más que el salario promedio de toda la compañía.',
    nivelConceptual:
      'Una subconsulta es un SELECT incrustado dentro de otro. Piensa en dos pasos: primero calculas el promedio en un cálculo auxiliar y después usas ese número en la consulta principal. El resultado interno alimenta a la consulta externa.',
    nivelLogico:
      '1) Se evalúa (SELECT AVG(salario) FROM empleados) → un único valor escalar, aquí 3480. 2) La consulta externa filtra WHERE salario > 3480. Si la subconsulta devolviera varias filas y se usa con > o =, el motor lanza un error.',
    nivelSintactico:
      'SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados);\n\n- La subconsulta va SIEMPRE entre paréntesis ().\n- Con operadores escalares (>, <, =) debe devolver una sola fila y una sola columna.',
    ejemploSql:
      'SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados);',
    tablas: [
      {
        nombre: 'empleados',
        descripcion: 'Nómina de Innovación Tecnológica.',
        columnas: [
          { nombre: 'id_empleado', tipo: 'INTEGER' },
          { nombre: 'nombre', tipo: 'VARCHAR' },
          { nombre: 'puesto', tipo: 'VARCHAR' },
          { nombre: 'salario', tipo: 'DECIMAL' },
        ],
        filas: [
          { id_empleado: 1, nombre: 'Ana', puesto: 'Analista', salario: 3000.0 },
          { id_empleado: 2, nombre: 'Luis', puesto: 'Programador', salario: 3800.0 },
          { id_empleado: 3, nombre: 'Sofía', puesto: 'Diseñadora', salario: 2800.0 },
          { id_empleado: 4, nombre: 'Iván', puesto: 'Líder', salario: 4600.0 },
          { id_empleado: 5, nombre: 'María', puesto: 'QA', salario: 3200.0 },
        ],
      },
    ],
    consultaCorrecta:
      'SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados);',
    clavesValidacion: [
      'select nombre, salario',
      'from empleados',
      'where salario >',
      'select avg(salario) from empleados',
    ],
    resultadoColumnas: ['nombre', 'salario'],
    resultadoFilas: [
      { nombre: 'Luis', salario: 3800 },
      { nombre: 'Iván', salario: 4600 },
    ],
    preguntaRazonamiento:
      'Si ejecutas SELECT nombre FROM empleados WHERE salario > (SELECT salario FROM empleados); (50 registros), ¿qué pasará?',
    opcionesPrediccion: [
      'Mostrará a todos los empleados',
      'Error: la subconsulta devuelve 50 filas y > exige un valor escalar',
      'Calculará el promedio solo',
      'Filtrará por el último salario',
    ],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Primero resuelve cuál es el promedio con una subconsulta entre paréntesis.',
      'La consulta externa es SELECT nombre, salario FROM empleados WHERE salario > ( ... )',
      'Dentro de los paréntesis escribe la agregación: (SELECT AVG(salario) FROM empleados).',
      'Solución completa: SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados);',
    ],
    retroalimentacionError:
      'El filtro no compara contra el promedio. Asegúrate de encerrar entre paréntesis un SELECT AVG(salario) FROM empleados justo después del operador >.',
    resolucionComentada:
      'Promedio = (3000+3800+2800+4600+3200)/5 = 3480. Superan ese salario Luis (3800) e Iván (4600).',
    preguntasDiagnostico: [
      {
        pregunta: '¿Para qué se enmarca SIEMPRE una subconsulta?',
        opciones: [
          'Entre corchetes [ ]',
          'Entre paréntesis ( )',
          'Entre llaves { }',
          'No es obligatorio',
        ],
        indiceCorrecto: 1,
        explicacion:
          'La subconsulta debe ir entre paréntesis para delimitarla del resto de la sentencia.',
      },
      {
        pregunta: '¿Qué debe devolver una subconsulta usada con el operador >?',
        opciones: [
          'Muchas filas y muchas columnas',
          'Una sola fila y una sola columna',
          'Una tabla completa',
          'Nada',
        ],
        indiceCorrecto: 1,
        explicacion:
          'Para comparar con > o = el motor necesita un único valor escalar a la derecha.',
      },
      {
        pregunta: 'En la misión, ¿cuál es el promedio de la empresa?',
        opciones: ['3480', '4600', '2800', '3000'],
        indiceCorrecto: 0,
        explicacion: 'La suma es 17400 entre 5 empleados = 3480.',
      },
    ],
    xpRecompensa: 100,
  },
  {
    numero: 10,
    codigo: 'SQL-10',
    titulo: 'Manipulación de Datos (DML)',
    tema: 'UPDATE + WHERE (modificar con seguridad)',
    temaGrafico: 'mutar',
    objetivoClaro:
      "Escribe la instrucción que aumente un 10% el precio SOLO de los productos de la categoría Electrónica: UPDATE productos SET precio = precio * 1.10 WHERE categoria = 'Electrónica';",
    contexto:
      '"MegaStore" lanzó una promoción: aumenta un 10% el precio de todos los productos de la categoría Electrónica, sin tocar el resto del catálogo.',
    nivelConceptual:
      'DML modifica el estado almacenado: INSERT agrega una hoja, UPDATE corrige un dato con bolígrafo y DELETE tritura hojas. Peligro: si escribes UPDATE sin WHERE, ¡modificas TODA la tabla! Siempre delimita los registros a afectar.',
    nivelLogico:
      "1) WHERE categoria = 'Electrónica' ubica exactamente las tuplas objetivo. 2) SET precio = precio * 1.10 reescribe esos campos. 3) El motor registra la transacción y la confirma. Las filas de otras categorías no se tocan.",
    nivelSintactico:
      "UPDATE productos SET precio = precio * 1.10 WHERE categoria = 'Electrónica';\n\n- UPDATE: tabla objetivo.\n- SET: columna y nueva expresión.\n- WHERE: delimita qué filas cambian (OJO: es prácticamente obligatorio como seguridad).",
    ejemploSql: "UPDATE productos SET precio = precio * 1.10 WHERE categoria = 'Electrónica';",
    tablas: [
      {
        nombre: 'productos',
        descripcion: 'Catálogo de MegaStore.',
        columnas: [
          { nombre: 'id_producto', tipo: 'INTEGER' },
          { nombre: 'nombre', tipo: 'VARCHAR' },
          { nombre: 'categoria', tipo: 'VARCHAR' },
          { nombre: 'precio', tipo: 'DECIMAL' },
        ],
        filas: [
          { id_producto: 1, nombre: 'Lámpara LED', categoria: 'Electrónica', precio: 300.0 },
          { id_producto: 2, nombre: 'Router', categoria: 'Electrónica', precio: 700.0 },
          { id_producto: 3, nombre: 'Mesa de madera', categoria: 'Muebles', precio: 1500.0 },
          { id_producto: 4, nombre: 'Cargador USB', categoria: 'Electrónica', precio: 250.0 },
        ],
      },
    ],
    consultaCorrecta:
      "UPDATE productos SET precio = precio * 1.10 WHERE categoria = 'Electrónica';",
    clavesValidacion: [
      'update productos',
      'set precio = precio * 1.10',
      "where categoria = 'electrónica'",
    ],
    resultadoColumnas: ['Mensaje'],
    resultadoFilas: [
      { Mensaje: '3 filas actualizadas en la categoría Electrónica (+10%).' },
      { Mensaje: 'Lámpara LED: 330.00 · Router: 770.00 · Cargador USB: 275.00' },
      { Mensaje: 'Mesa de madera (Muebles) no se modificó: 1500.00' },
    ],
    preguntaRazonamiento:
      'Si ejecutas por descuido UPDATE productos SET precio = 0; en producción, ¿qué ocurre?',
    opcionesPrediccion: [
      'Solo los productos con precio 0 cambian',
      'Todos los productos pasan a costar 0 de forma irreversible',
      'Ocurre un error porque falta WHERE',
      'Se lanza una advertencia y no se ejecuta',
    ],
    indicePrediccionCorrecta: 1,
    pistas: [
      'Para este reto NO uses SELECT. Usa un comando DML de actualización.',
      'Escribe UPDATE productos, asigna el cálculo con SET y añade WHERE.',
      "La fórmula es precio = precio * 1.10 y la condición WHERE categoria = 'Electrónica'.",
      "Solución completa: UPDATE productos SET precio = precio * 1.10 WHERE categoria = 'Electrónica';",
    ],
    retroalimentacionError:
      'La modificación no quedó acotada correctamente. Verifica UPDATE productos, SET precio = precio * 1.10 y el WHERE con comillas simples alrededor de Electrónica.',
    resolucionComentada:
      "UPDATE productos SET precio = precio * 1.10 WHERE categoria = 'Electrónica'; — se actualizan 3 de 4 filas; la Mesa de madera (Muebles) queda intacta.",
    preguntasDiagnostico: [
      {
        pregunta: '¿Qué ocurre si ejecutas UPDATE sin WHERE?',
        opciones: [
          'No pasa nada',
          'Todas las filas de la tabla se modifican',
          'Solo cambia la primera fila',
          'La consulta se descarta sola',
        ],
        indiceCorrecto: 1,
        explicacion: 'Sin WHERE no hay delimitación: el UPDATE muta TODAS las filas.',
      },
      {
        pregunta: '¿Qué comando DML modifica registros existentes?',
        opciones: ['SELECT', 'INSERT', 'UPDATE', 'CREATE'],
        indiceCorrecto: 2,
        explicacion:
          'UPDATE actualiza valores ya almacenados. INSERT crea nuevos y SELECT solo lee.',
      },
      {
        pregunta:
          "En la misión, ¿cuántas filas se actualizan con la condición categoria = 'Electrónica'?",
        opciones: ['1 fila', '3 filas', '4 filas', 'Ninguna'],
        indiceCorrecto: 1,
        explicacion:
          'Tres productos son Electrónica (Lámpara, Router, Cargador). La mesa no cambia.',
      },
    ],
    xpRecompensa: 100,
  },
];

export function misionPorNumero(numero: number | null | undefined): MisionSqlConfig {
  return MISIONES_SQL.find((mision) => mision.numero === numero) ?? MISIONES_SQL[0];
}
