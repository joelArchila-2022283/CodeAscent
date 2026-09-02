-- ------------------------------------------------------------
-- INSERCIÓN DE DATOS
-- ------------------------------------------------------------

-- Lenguajes
CALL sp_crear_lenguaje('SQL', 'Lenguaje estándar para la gestión, consulta y manipulación de bases de datos relacionales.', TRUE);
CALL sp_crear_lenguaje('HTML', 'Lenguaje de marcado utilizado para estructurar el contenido de las páginas y aplicaciones web.', TRUE);
CALL sp_crear_lenguaje('CSS', 'Lenguaje de estilos para diseñar y personalizar la presentación visual de interfaces web.', TRUE);
CALL sp_crear_lenguaje('TypeScript', 'Superset tipado de JavaScript diseñado para construir aplicaciones web escalables y robustas.', TRUE);

-- Usuarios
CALL sp_crear_usuario('Administrador', 'admin@codeascent.com', 'AdminPass123!', 'admin');
CALL sp_crear_usuario('Jugador Uno', 'jugador1@email.com', 'PlayerPass123!', 'jugador');

-- Logros
CALL sp_crear_logro('Primer Paso', 'Completa tu primer nivel en cualquier lenguaje.', 50, 'Completar 1 Nivel');
CALL sp_crear_logro('Maestro SQL', 'Completa los 10 niveles de SQL.', 500, 'Completar Nivel 10 de SQL');
CALL sp_crear_logro('Desarrollador Frontend', 'Completa los niveles de HTML y CSS.', 1000, 'Completar HTML y CSS');

-- Niveles: SQL (10 Niveles)
CALL sp_crear_nivel('SQL', 'Introducción a Bases de Datos', 1, 'Conceptos clave de modelos relacionales.', 50);
CALL sp_crear_nivel('SQL', 'Sentencia SELECT Básica', 2, 'Consultar filas y columnas específicas.', 100);
CALL sp_crear_nivel('SQL', 'Filtros con WHERE', 3, 'Uso de operadores lógicos y de comparación.', 150);
CALL sp_crear_nivel('SQL', 'Ordenamiento y Límites', 4, 'Aplicación de ORDER BY y LIMIT/OFFSET.', 200);
CALL sp_crear_nivel('SQL', 'Funciones de Agregación', 5, 'Uso de COUNT, SUM, AVG, MIN y MAX.', 250);
CALL sp_crear_nivel('SQL', 'Agrupamiento con GROUP BY', 6, 'Agrupar registros y filtrar con HAVING.', 300);
CALL sp_crear_nivel('SQL', 'Uniones con INNER JOIN', 7, 'Combinar información de múltiples tablas.', 350);
CALL sp_crear_nivel('SQL', 'Uniones Externas (LEFT / RIGHT JOIN)', 8, 'Manejo de registros no coincidentes.', 400);
CALL sp_crear_nivel('SQL', 'Subconsultas y CTEs', 9, 'Consultas anidadas y expresiones de tabla.', 450);
CALL sp_crear_nivel('SQL', 'Manipulación de Datos (DML)', 10, 'Uso avanzado de INSERT, UPDATE y DELETE.', 500);

-- Niveles: HTML (10 Niveles)
CALL sp_crear_nivel('HTML', 'Estructura Básica Documento', 1, 'Etiquetas doctype, html, head y body.', 50);
CALL sp_crear_nivel('HTML', 'Encabezados y Párrafos', 2, 'Jerarquía de texto con h1-h6 y p.', 100);
CALL sp_crear_nivel('HTML', 'Enlaces y Navegación', 3, 'Uso del elemento a y rutas relativas/absolutas.', 150);
CALL sp_crear_nivel('HTML', 'Imágenes y Multimedia', 4, 'Inserción de img, audio y video.', 200);
CALL sp_crear_nivel('HTML', 'Listas Ordenadas y Desordenadas', 5, 'Estructuración mediante ul, ol y li.', 250);
CALL sp_crear_nivel('HTML', 'Tablas de Datos', 6, 'Creación de tablas con table, tr, th y td.', 300);
CALL sp_crear_nivel('HTML', 'Formularios Básicos', 7, 'Uso de form, input, label y button.', 350);
CALL sp_crear_nivel('HTML', 'Tipos de Input Avanzados', 8, 'Validación nativa con email, number y date.', 400);
CALL sp_crear_nivel('HTML', 'HTML Semántico', 9, 'Uso de header, nav, main, section y footer.', 450);
CALL sp_crear_nivel('HTML', 'Atributos Globales y Accesibilidad', 10, 'Atributos ARIA, id, class y lang.', 500);

-- Niveles: CSS (10 Niveles)
CALL sp_crear_nivel('CSS', 'Sintaxis y Selectores Básicos', 1, 'Selectores de elemento, clase e ID.', 50);
CALL sp_crear_nivel('CSS', 'Modelo de Caja (Box Model)', 2, 'Manejo de margin, border, padding y content.', 100);
CALL sp_crear_nivel('CSS', 'Colores y Fondos', 3, 'Uso de HEX, RGB, HSL y propiedades de background.', 150);
CALL sp_crear_nivel('CSS', 'Tipografía y Fuentes', 4, 'Propiedades font-family, size, weight y line-height.', 200);
CALL sp_crear_nivel('CSS', 'Posicionamiento', 5, 'Estrategias static, relative, absolute y fixed.', 250);
CALL sp_crear_nivel('CSS', 'Flexbox Contenedor', 6, 'Alineación con display flex y justify-content.', 300);
CALL sp_crear_nivel('CSS', 'Flexbox Elementos', 7, 'Uso de flex-grow, flex-shrink y align-self.', 350);
CALL sp_crear_nivel('CSS', 'CSS Grid Layout', 8, 'Definición de filas y columnas con grid-template.', 400);
CALL sp_crear_nivel('CSS', 'Diseño Responsivo', 9, 'Uso de Media Queries y unidades relativas (rem/em).', 450);
CALL sp_crear_nivel('CSS', 'Transiciones y Animaciones', 10, 'Efectos con transition, transform y keyframes.', 500);

-- Niveles: TypeScript (10 Niveles)
CALL sp_crear_nivel('TypeScript', 'Tipos Primitivos', 1, 'Declaración explicita con string, number y boolean.', 50);
CALL sp_crear_nivel('TypeScript', 'Inferencia de Tipos', 2, 'Comprensión del tipado implícito en TS.', 100);
CALL sp_crear_nivel('TypeScript', 'Arreglos y Tuplas', 3, 'Definición de arrays tipados y tuplas fijas.', 150);
CALL sp_crear_nivel('TypeScript', 'Interfaces Básicas', 4, 'Definición de contratos de estructura de objetos.', 200);
CALL sp_crear_nivel('TypeScript', 'Type Aliases', 5, 'Creación de tipos personalizados y de unión.', 250);
CALL sp_crear_nivel('TypeScript', 'Tipado de Funciones', 6, 'Parámetros opcionales, por defecto y retorno.', 300);
CALL sp_crear_nivel('TypeScript', 'Enums y Literales', 7, 'Uso de enumeraciones numéricas y de cadena.', 350);
CALL sp_crear_nivel('TypeScript', 'Clases y Modificadores', 8, 'Uso de public, private, protected y readonly.', 400);
CALL sp_crear_nivel('TypeScript', 'Genéricos Básicos', 9, 'Creación de componentes y funciones reutilizables.', 450);
CALL sp_crear_nivel('TypeScript', 'Narrowing y Type Guards', 10, 'Verificación estricta de tipos en tiempo de ejecución.', 500);

-- Lecciones (5 Registros)
CALL sp_crear_leccion(1, '¿Qué es una Base de Datos Relacional?', 'Una base de datos relacional organiza la información en tablas...', 1);
CALL sp_crear_leccion(2, 'Sintaxis de la Consulta SELECT', 'La instrucción SELECT recupera filas y columnas específicas...', 1);
CALL sp_crear_leccion(11, 'Estructura Fundamental de HTML5', 'Un archivo HTML5 contiene el DOCTYPE, html, head y body...', 1);
CALL sp_crear_leccion(21, 'Reglas de Estilo y Selectores CSS', 'CSS aplica reglas compuestas por un selector y bloque de declaraciones...', 1);
CALL sp_crear_leccion(31, 'Declaración de Tipos Primitivos en TS', 'TypeScript permite asociar tipos explicitos a las variables...', 1);

-- Ejemplos (5 Registros)
CALL sp_crear_ejemplo(1, 'Consulta SELECT Simple', 'SELECT * FROM usuario;', 'Muestra todas las filas y columnas registradas en la tabla usuario.');
CALL sp_crear_ejemplo(2, 'Filtrar con WHERE', 'SELECT nombre, correo FROM usuario WHERE rol = ''jugador'';', 'Filtra y devuelve unicamente a los usuarios con el rol de jugador.');
CALL sp_crear_ejemplo(3, 'Plantilla Básica HTML', '<!DOCTYPE html>' || chr(10) || '<html>' || chr(10) || '<head><title>Mi Pagina</title></head>' || chr(10) || '<body><h1>Hola Mundo</h1></body>' || chr(10) || '</html>', 'Estructura minima obligatoria para un documento HTML5 estándar.');
CALL sp_crear_ejemplo(4, 'Regla CSS para Títulos', 'h1 {' || chr(10) || '  color: #3498db;' || chr(10) || '  text-align: center;' || chr(10) || '}', 'Establece color azul y alineacion centrada para todas las etiquetas H1.');
CALL sp_crear_ejemplo(5, 'Tipado de Variables TS', 'const nombreUsuario: string = "Carlos";' || chr(10) || 'const nivelActual: number = 5;' || chr(10) || 'const estaActivo: boolean = true;', 'Ejemplo de asignación explicita para string, number y boolean en TypeScript.');