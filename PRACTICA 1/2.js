const miFuncion = (cad) => {
    let nueva = "";

    for(let i=cad.length-1; i>=0; i--){
        nueva = nueva + cad[i];
    }

    return nueva;
}

let cad = miFuncion("abcd");
console.log(cad);