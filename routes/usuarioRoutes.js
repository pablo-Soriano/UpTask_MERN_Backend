import express from 'express';
const router = express.Router();

import {registrar, autenticar, confirmar,olvidePassword, comprobarToken, nuevoPassword, perfil} from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js';


// Autenticacion, Registro y Confirmacion de Usuarios
router.post('/', registrar);  // Crear un nuevo usuario
router.post('/login', autenticar);  // Autenticar a un usuario  esta ruta se suma a /api/usuarios, quedaria: /api/usuarios/login
router.get('/confirmar/:token', confirmar) // confirma un usuario, lo activa por el token, para que puedan loguearse, activa al usuario.
router.post('/olvide-password', olvidePassword); // recuperar password, crea un nuevo token en el usuario.
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);
/*  estas rutas son simplificadas por la ruta de arriba
router.get('/olvide-password/:token', comprobarToken); // este endpoint solo comprueba que el token sea valido y que el usuario exista
router.post('/olvide-password/:token', nuevoPassword); // este endpoint guarda nuevo password
 */

router.get('/perfil', checkAuth, perfil); //checkAuth valida que el usuario este logueado, jwt valido, que no este expirado.




export default router;