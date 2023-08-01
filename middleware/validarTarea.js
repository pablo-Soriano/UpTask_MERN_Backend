import mongoose from "mongoose";
import Tarea from "../models/Tarea.js";

export const validarTarea = async (req, res, next) => {
    const {id} = req.params;
    const validarId = mongoose.Types.ObjectId.isValid(id)

    if(!validarId) {
        const error = new Error('Tarea no Existe!');
        return res.status(404).json({msg: error.message});
    }
    
    const tarea = await Tarea.findById(id).populate("proyecto"); // esto para hacer uso de la refencia en el modelo Tarea, en el campo proyecto, trae informacion del proyecto por la relacion de ID

    if(!tarea) {
        const error = new Error("No existe tarea!");
        return res.status(404).json({ msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some( (colaborador) => colaborador._id.toString() === req.usuario._id.toString() )){
        const error = new Error("No está autorizado, para obtener  o cambiar tareas!");
        return res.status(403).json({ msg: error.message});
    }
    next();
}