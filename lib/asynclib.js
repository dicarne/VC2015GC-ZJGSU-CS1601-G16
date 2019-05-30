Array.prototype.AsyncForeach = async function (func){
    let array = this;
    for (let index = 0; index < array.length; index++) {
        let element = array[index];
        await func(element, index);
    }
}