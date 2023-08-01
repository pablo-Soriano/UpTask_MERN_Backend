const generarId = ()=> {
    /* esta cadena genera un numero aleatorio, menor a 1 por eso siempre lleva 0. , .toString(32) lo conviernte de numeros a combinar numeros y letras,  el .substring(2) elimina el entero y el punto al inicio. */
    const random = Math.random().toString(32).substring(2); 
    const fecha = Date.now().toString(32);

    return random + fecha;
}

export default generarId;