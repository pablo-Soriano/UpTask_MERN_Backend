import express from 'express';
import {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
} from '../controllers/tareaController.js';
import checkAuth from '../middleware/checkAuth.js';
import { validarTarea } from '../middleware/validarTarea.js';


const router = express.Router();


router.post('/', checkAuth, agregarTarea);
router.route('/:id')
    .get(checkAuth, validarTarea, obtenerTarea)
    .put(checkAuth, validarTarea, actualizarTarea)
    .delete(checkAuth, validarTarea, eliminarTarea);

router.post('/estado/:id', checkAuth, validarTarea, cambiarEstado);



export default router;