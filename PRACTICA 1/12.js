// Antes (callback)
setTimeout(() => {
    console.log("Hola");
}, 2000);

// Después
const esperar = () => {
    return new Promise(resolve => {
        setTimeout(resolve, 2000);
    });
}

const main = async () => {
    await esperar();
    console.log("Hola");
}

main();