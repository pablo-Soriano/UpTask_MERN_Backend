import express from 'express';
import {    
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
    } from '../controllers/proyectoController.js';
import checkAuth from '../middleware/checkAuth.js';
import { validarProyecto } from '../middleware/validarProyecto.js';

const router = express.Router();

router.route('/')
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto);

router.route('/:id')
    .get(checkAuth, validarProyecto, obtenerProyecto) //el orden de los middleware es importante, se ejecuta la autenticacion luego validar Proyecto, al final obtener proyecto
    .put(checkAuth, validarProyecto, editarProyecto)
    .delete(checkAuth, validarProyecto ,eliminarProyecto);

router.post('/colaboradores', checkAuth, buscarColaborador);  // buscar colaboradores por medio de su correo.
router.post('/colaboradores/:id', checkAuth, agregarColaborador); // id es el id del proyecto
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador); // se usa post para eliminar, porque no se elimina todo el elemento, solo un colaborador del proyecto, recibe el id del proyecto.

export default router;
