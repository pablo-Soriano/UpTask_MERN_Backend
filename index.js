import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';


const app = express();
app.use(express.json());  // permite leer informacion de tipo json

dotenv.config();  //buscara el archivo .env para el manejo de las variables de conexion

conectarDB();

// Configurar CORS
const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback) {
        //console.log(origin);
        if(whiteList.includes(origin)) {
            callback(null, true);   // callback evalua si hay error o no, al poner null le indicamos que no hay error y con el true le permite el paso
        } else {
            callback(new Error("Error de CORS"));
        }
    }
};

app.use(cors(corsOptions));

// ROUTING
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Socket.io
import {Server} from 'socket.io';

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
        
    }
});

io.on('connection', (socket) => {
  //  console.log('Conectado a socket.io');

    // Definir los veventos de socket.io
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto);
    });

    socket.on('nueva tarea', (tarea) => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea agregada', tarea);
    });

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea eliminada', tarea);
    });

    socket.on('actualizar tarea', tarea => {
        //console.log(tarea);
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea actualizada', tarea);
    });

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea);
    });

});