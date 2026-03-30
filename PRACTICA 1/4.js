const miFuncion = (arr) => {
    let mayor = arr[0];
    let menor = arr[0];

    for(let n of arr){
        if(n > mayor) mayor = n;
        if(n < menor) menor = n;
    }

    return {mayor, menor};
}

let obj = miFuncion([3,1,5,4,2]);
console.log(obj);