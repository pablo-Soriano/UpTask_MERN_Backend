import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";

export const validarProyecto = async (req, res, next) => {

    const {id} = req.params;
    const validarId = mongoose.Types.ObjectId.isValid(id)

    if(!validarId) {
        const error = new Error('Proyecto no Existe!');
        return res.status(404).json({msg: error.message});
    }

    // con el populate hacemos un inner join que se trae las tareas, el nombre Tarea en populate, es el nombre que le damos al campo, en este caso tareas, en el modelo de la tabla Proyecto
    const proyecto = await Proyecto.findById(id);
    
    if(!proyecto) {
        const error = new Error("No encontrado!");
        return res.status(404).json({ msg: error.message });
    }

    // Validar si el usuario que creo el proyecto es el usuario logueado
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString() )) {
        const error = new Error("No está autorizado en el Proyecto..!");
        return res.status(401).json({ msg: error.message });
    }
    next();
}

