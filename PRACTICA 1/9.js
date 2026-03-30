const miPromesa = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Éxito después de 3 segundos");
        }, 3000);
    });
}

miPromesa().then(res => console.log(res));