const miFuncion = (cad) => {
    let inv = "";

    for(let i=cad.length-1; i>=0; i--){
        inv += cad[i];
    }

    if(cad === inv)
        return true;
    else
        return false;
}

let band = miFuncion("oruro");
console.log(band);

band = miFuncion("hola");
console.log(band);