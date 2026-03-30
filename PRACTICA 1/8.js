const ejecutar = (callback) => {
    setTimeout(() => {
        callback();
    }, 2000);
}

const miFuncion = () => {
    console.log("Se ejecuto callback");
}

ejecutar(miFuncion);