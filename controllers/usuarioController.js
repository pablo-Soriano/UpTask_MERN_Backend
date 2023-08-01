import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import {emailRegistro, emailOlvidePassword} from '../helpers/email.js';

// Crear un nuevo usuario
const registrar = async (req, res) => {
  //Evitar registros duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email });

  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message }); // .message es para acceder al mensaje que he creado en la linea anterior.
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    /*const usuarioAlmacenado = */ await usuario.save();
    //res.json({msg: 'Creando usuario'});
    
    // Enviar email de confirmacion.
    //console.log(usuario);
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    });

    res.json({msg: 'Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta!'});
  } catch (error) {
    console.log(error);
  }
};

// autenticar usuario
const autenticar = async (req, res) => {
  const { email, password } = req.body;

  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  // comprobar si el usuario esta confirmado(estado para saber si usuario esta activo)
  if (!usuario.confirmado) {
    const error = new Error("Tu Cuenta no ha sido confirmada");
    return res.status(403).json({ msg: error.message });
  }

  // comprobar su password  - se utiliza comprobarPassword funcion creada en el modelo del usuario
  if (await usuario.comprobarPassword(password)) {
    // este password es el que estamos destructurando de req.body: const { email, password } = req.body;
    // si la funcion comprobarPassword devuelve True, enviamos por json la informacion del usuario logueado.
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("El password es Incorrecto!");
    return res.status(403).json({ msg: error.message });
  }
};

// Confirmar, busca al usuario por el token, le cambia estado a confirmado = true, y elimina el token, es para activar al usuario despues del registro y permita login.
const confirmar = async (req, res) => {
  const { token } = req.params;
  const usuarioConfirmar = await Usuario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error("Token no válido!");
    return res.status(403).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario Confirmado Correctamente!" });
    //console.log(usuarioConfirmar);
  } catch (error) {
    console.log(error);
  }
};

// recuperar contraseña
const olvidePassword = async (req, res) => {
  const { email } = req.body;

  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuario.token = generarId();
    usuario.save();

    // Enviar el email
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    })

    res.json({msg: "Hemos enviado un email con las instrucciones"});
    //console.log(usuario);
  } catch (error) {
    console.log(error);
  }

};

// comprueba token y que exista usuario, despues que han solicitado cambiar constraseña de usuario
const comprobarToken = async (req, res) => {
  const {token} = req.params;

  const tokenValido = await Usuario.findOne({ token });

  if(tokenValido) {
    res.json({msg: 'Token válido y el Usuario Existe!'})
  } else {
    const error = new Error("Token no Válido!");
    return res.status(404).json({ msg: error.message });
  }

}

// Guarda la nueva contraseña
const nuevoPassword = async (req, res) => {
  const {token} = req.params;
  const {password} = req.body;

  const usuario = await Usuario.findOne({ token });

  if(usuario) {
    usuario.password = password;
    usuario.token = '';

    try {
      await usuario.save();
      res.json({msg: 'Password Modificado Correctamente!'})
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error("Token no Válido!");
    return res.status(404).json({ msg: error.message });
  }

}

const perfil = async(req, res) => {
  const {usuario} = req;

  res.json(usuario);
}


export { registrar, 
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
