const obtenerDatos = () => {
    return Promise.resolve("Datos obtenidos");
}

const main3 = async () => {
    let datos = await obtenerDatos();
    console.log(datos);
}

main3();