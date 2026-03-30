const miFuncion = (texto) => {
    let obj = {a:0, e:0, i:0, o:0, u:0};

    for(let c of texto){
        if(obj[c] !== undefined){
            obj[c]++;
        }
    }

    return obj;
}

let obj = miFuncion("euforia");
console.log(obj);