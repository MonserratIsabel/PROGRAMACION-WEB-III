const promesa = () => {
    return Promise.resolve("Hola");
}

const usarCallback = (cb) => {
    promesa().then(res => cb(res));
}

usarCallback((msg) => console.log(msg));