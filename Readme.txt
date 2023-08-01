1.npm init  -  inicializa el package json
2. instalamos express
3. se establece en el package json :
    "dev": "nodemon index.js",
    "start": "node index.js"
4.se crea archivo index.js
5. se inicializa el servidor en index.js:
    import express from 'express';

    const app = express();

    app.listen(4000, () => {
        console.log('Servidor corriendo en puerto 4000');
    });

    primero creamos el modelo, luego routes
