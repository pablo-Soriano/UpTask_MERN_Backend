import mongoose from "mongoose";
import bcrypt from 'bcrypt';


const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique:true
    }, token:{
        type: String,

    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

usuarioSchema.pre('save', async function(next) {

    if(!this.isModified('password')){ // detecta si no se ha modificado el password, no lo hashea nuevamente, pasa al siguiente middleware
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);  // this.password es la contraseña del formulario, sin hashear.

});

usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)        // aqui devolvera un false o un true
}

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;