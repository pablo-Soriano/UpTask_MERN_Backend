import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// valida el JWT
const checkAuth = async (req, res, next) => {
    //proteger las rutas
    let token;
    if( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // separa la palabra bearer del token, que viene en el headers y el token pasa a ser la poision 1, [1] y se asigna ese valor a token
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // se crea la variable usuario en el req para poder acceder desde cualquier controlador y cualquier lugar de la aplicacion.
            req.usuario = await Usuario.findById(decoded.id).select("_id nombre email");  //select("_id nombre email") solo muestra las columnas que he permitido, tambien se puede colocando -password por si quiero eliminar una o dos columnas.
            return next();
        } catch (error) {
            return res.status(404).json({msg: 'Hubo un error!'});
        }
    }

    if(!token) {
        const error = new Error('Token no Válido!');
        return res.status(401).json({msg: error.message});
    }

    next();
}

export default checkAuth;