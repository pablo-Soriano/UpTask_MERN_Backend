import Proyecto from "../models/Proyecto.js";
import mongoose from "mongoose";
import Tarea from "../models/Tarea.js";
import { json } from "express";
import Usuario from "../models/Usuario.js";

// obtener todos los proyectos del usuario autenticado
const obtenerProyectos = async (req, res) => {
  // este codigo: .select('-tareas'); es para que no muestre el campo tareas, porque en esta vista no es necesario mostrarlo
  //const proyectos = await Proyecto.find().where("creador").equals(req.usuario).select('-tareas');
  // se ambio la consulta anterior, por esta, para que los colaboradores, al loguearse puedan ver los proyectos a los que estan agregados.
    const proyectos = await Proyecto.find({
      // los campos colaboradores y creador, son los nombres de campos que estan en el modelo proyecto
    '$or': [
      { colaboradores: { $in: req.usuario} },
      { creador: { $in: req.usuario} }

    ]
  }).select('-tareas');

  res.json(proyectos);
};

// Crear nuevo proyectos
const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id; //capturamos el id del usuario, que lo obtenemos en el checkAuth.js

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

// obtener un proyecto y listar las tareas asociadas a el.
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  /*  todo el codigo comentariado se traslado al middleware validarProyecto.js
  const validarId = mongoose.Types.ObjectId.isValid(id)

    if(!validarId) {
        const error = new Error('Proyecto no Existe!');
        return res.status(404).json({msg: error.message});
    }
 */

  /* if(!proyecto) {
        const error = new Error("No encontrado!");
        return res.status(404).json({ msg: error.message });
    }

    // Validar si el usuario que creo el proyecto es el usuario logueado
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No está autorizado..!");
        return res.status(401).json({ msg: error.message });
    }
 */

  try {
    //en populate no funciona el select, para mostrar solo los campos que deseamos, en ese caso, se hace como colaboradores, en el populate, despues del campo, colaboradores, se agrega una coma y los campos que queremos mostrar, se colocan entre comillas como string.
    const proyecto = await Proyecto.findById(id).populate({ path:'tareas', populate: { path: 'completado', select: 'nombre' }}).populate('colaboradores', 'nombre email');

    // Obtener tareas asociadas a un proyecto - se puso como comentario, ya que devolvia en la respuesta las tareas y se hizo diferente
    //const tareas = await Tarea.find().where('proyecto').equals(proyecto._id);

  /*   res.json({
      proyecto,
      tareas
    }); */

    res.json(proyecto);
  } catch (error) {
    console.log(error);
  }

  /*     console.log(proyecto.creador);
    console.log(req.usuario._id); */
};

// editar un proyecto
const editarProyecto = async (req, res) => {
    const {id} = req.params;
    /* 
    const proyecto = await Proyecto.findById(id);

      esta es una forma, la forma mas simplificada es la que esta en el try con findbyIDAndUpdate.
    // a proyecto.nombre se le asigna el valor del nombre del req o formulario, sino trae, se deja el de la base de datos
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;
 */


    try {
//      const proyectoAlmacenado = await proyecto.save();
        const proyectoActualizar = await Proyecto.findByIdAndUpdate(id, req.body, { new: true });
        res.json(proyectoActualizar);
    } catch (error) {
        console.log(error);
    }

};

// eliminar proyecto
const eliminarProyecto = async (req, res) => {
    const {id} = req.params;
    const proyecto = await Proyecto.findById(id);
    try {
        await proyecto.deleteOne();
        res.json({ msg: "Proyecto Eliminado" } );
    } catch (error) {
        console.log(error);
    }
};

// Buscar colaboradores
const buscarColaborador = async (req, res) => {
  const {email} = req.body;

  const usuario = await Usuario.findOne({email}).select('email nombre _id');

  if(!usuario) {
    const error = new Error('Usuario no encontrado!');
    return res.status(404).json({msg: error.message});
  }

  res.json(usuario);

}

// Agregar colaboradores a un proyecto
const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  // validar que exista el proyecto
  if(!proyecto) {
    const error = new Error('Proyecto no Encontrado!');
    return res.status(404).json({msg: error.message});
  }

  // Validar que solo el creador del proyecto puede agregar un colaborador
  if(proyecto.creador.toString()  !== req.usuario._id.toString() ) {
    const error = new Error('Acción no Válida!');
    return res.status(404).json({msg: error.message});
  }

  // si pasa las validaciones, se busca el correo, para validar que si exista.
  const {email} = req.body;

  const usuario = await Usuario.findOne({email}).select('email nombre _id');

  if(!usuario) {
    const error = new Error('Usuario no encontrado!');
    return res.status(404).json({msg: error.message});
  }

  // El colaborador no puede ser el admin del proyecto
  if(proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('El Creador del Proyecto, No puede ser colaborador!');
    return res.status(404).json({msg: error.message});
  }

  // Validar si el usuario ya esta agregado al proyecto(que no permita agregar dos veces al mismo usuario)
  if(proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El Usuario ya pertenece al proyecto!');
    return res.status(404).json({msg: error.message});
  }

  // si pasa todas la validaciones, se puede agregar
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: 'Colaborador Agregado correctamente!'});

};

// Eliminar un colaboradores a un proyecto
const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  // validar que exista el proyecto
  if(!proyecto) {
    const error = new Error('Proyecto no Encontrado!');
    return res.status(404).json({msg: error.message});
  }

  // Validar que solo el creador del proyecto puede agregar un colaborador
  if(proyecto.creador.toString()  !== req.usuario._id.toString() ) {
    const error = new Error('Acción no Válida!');
    return res.status(404).json({msg: error.message});
  }

  // si pasa todas la validaciones, se puede eliminar
  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({ msg: 'Colaborador Eliminado correctamente!'});
  

};



export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  
};
