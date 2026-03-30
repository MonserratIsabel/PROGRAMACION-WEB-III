const prom = () => {
    return Promise.resolve("Hola promesa");
}

const main = async () => {
    let r = await prom();
    console.log(r);
}

main();