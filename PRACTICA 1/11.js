const paso1 = () => {
    return Promise.resolve("Paso 1");
}

const paso2 = (msg) => {
    return Promise.resolve(msg + " -> Paso 2");
}

const paso3 = (msg) => {
    return Promise.resolve(msg + " -> Paso 3");
}

paso1()
    .then(res => paso2(res))
    .then(res => paso3(res))
    .then(res => console.log(res));