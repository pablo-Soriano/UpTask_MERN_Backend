import mongoose from "mongoose";

const proyectosSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true
    },
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    cliente: {
        type: String,
        trim: true,
        required: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
    },
    tareas:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tarea'
        }
    ],
    colaboradores: [ // se usan corchetes porque esto sera un arreglo de usuarios
        { // aqui hacemos la referencia a la coleccion usuarios
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario"            
        }
    ],
},{
    timestamps: true
});

const Proyecto = mongoose.model('Proyecto', proyectosSchema);
export default Proyecto;