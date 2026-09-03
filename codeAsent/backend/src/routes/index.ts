import { Router } from 'express';
import rutasUsuario from './usuario.routes';
import rutasLenguaje from './lenguaje.routes';
import rutasNivel from './nivel.routes';
import rutasLeccion from './leccion.routes';
import rutasEjemplo from './ejemplo.routes';
import rutasReto from './reto.routes';
import rutasRespuesta from './respuesta.routes';
import rutasIntento from './intento.routes';
import rutasProgreso from './progreso.routes';
import rutasNivelUsuario from './nivelUsuario.routes';
import rutasLogro from './logros.routes';
import rutasUsuarioLogro from './usuarioLogro.routes';

const enrutadorPrincipal = Router();

enrutadorPrincipal.use('/usuarios', rutasUsuario);
enrutadorPrincipal.use('/lenguajes', rutasLenguaje);
enrutadorPrincipal.use('/niveles', rutasNivel);
enrutadorPrincipal.use('/lecciones', rutasLeccion);
enrutadorPrincipal.use('/ejemplos', rutasEjemplo);
enrutadorPrincipal.use('/retos', rutasReto);
enrutadorPrincipal.use('/respuestas', rutasRespuesta);
enrutadorPrincipal.use('/intentos', rutasIntento);
enrutadorPrincipal.use('/progresos', rutasProgreso);
enrutadorPrincipal.use('/niveles-usuario', rutasNivelUsuario);
enrutadorPrincipal.use('/logros', rutasLogro);
enrutadorPrincipal.use('/usuarios-logros', rutasUsuarioLogro);

export default enrutadorPrincipal;