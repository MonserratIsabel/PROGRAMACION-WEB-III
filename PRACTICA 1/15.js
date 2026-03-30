const funcionCallback = (cb) => {
    setTimeout(() => {
        cb("Hola callback");
    }, 2000);
}

const convertirPromesa = () => {
    return new Promise(resolve => {
        funcionCallback(resolve);
    });
}

convertirPromesa().then(res => console.log(res));