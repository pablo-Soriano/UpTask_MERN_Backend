import Tarea from '../models/Tarea.js';
import Proyecto from '../models/Proyecto.js';


// Agregar Tarea
const agregarTarea = async (req, res) => {
    const {proyecto} = req.body;  //en la url se envia el id del proyecto, en el campo proyecto.

    const existeProyecto = await Proyecto.findById(proyecto);

    if(!existeProyecto) {
        const error = new Error("El Proyecto no existe!");
        res.status(404).json({ msg: error.message});
    }

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No está autorizado, para añadir tareas!");
        res.status(403).json({ msg: error.message});
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body);
        // Almacenar el Id en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error);
    }
}


// Obtener Tarea
const obtenerTarea = async (req, res) => {
     const {id} = req.params;
    
    try {
        const tarea = await Tarea.findById(id).populate("proyecto"); // esto para hacer uso de la refencia en el modelo Tarea, en el campo proyecto, trae informacion del proyecto por la relacion de ID
        res.json(tarea);
        //console.log(tarea);
    } catch (error) {
        console.log(error);
    }
}



// Actualizar Tarea
const actualizarTarea = async (req, res) => {
    const {id} = req.params;

    try {
        const tareaActualizada = await Tarea.findByIdAndUpdate(id, req.body, {new: true});
        res.json(tareaActualizada);

    } catch (error) {
        console.log(error);
    }

}


// Eliminar Tarea
const eliminarTarea = async (req, res) => {
 const {id} = req.params;

 const tareaEliminar = await Tarea.findById(id);
 
  try {
    //buscamos el proyecto
    const proyecto = await Proyecto.findById(tareaEliminar.proyecto);
    // luego quitamos de la variable proyecto, la tarea asociada y que queremos eliminar
    proyecto.tareas.pull(tareaEliminar._id);
    // con esta promesa hacemos que se ejecuten los dos cambios a la base, eliminar del proyecto la tarea asociada y eliminar la tarea de la tabla tareas.
    await Promise.allSettled([ await proyecto.save(), await tareaEliminar.deleteOne() ]);
    res.json({ msg: "La Tarea se Eliminó " } );
 } catch (error) {
    console.log(error);
 } 

}


// cambiar estado
const cambiarEstado = async (req, res) => {
    const {id} = req.params;

    const tarea = await Tarea.findById(id);
    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado')
    res.json(tareaAlmacenada);
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}
