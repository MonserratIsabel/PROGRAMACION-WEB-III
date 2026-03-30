const miFuncion = (arr) => {
    let obj = {pares: [], impares: []};

    for(let n of arr){
        if(n % 2 === 0)
            obj.pares.push(n);
        else
            obj.impares.push(n);
    }

    return obj;
}

let obj = miFuncion([1,2,3,4,5]);
console.log(obj);