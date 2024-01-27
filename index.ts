import WriteableStream from "./writeable";

// WRITE PART OF THE STREAM

const size:number = 10e+5;
let idx:number = 0;

const createWriteStream:WriteableStream =  new WriteableStream('write-stream.txt');
function write() {
    while (idx < size) {
        if(idx === size - 1) {
            createWriteStream.end(` ${idx} `);
            return;
        }
        
        if(!createWriteStream.write(` ${idx} `)) {
            break;
        }
        ++idx;
    }    
}

console.time('write');
write();

createWriteStream.on('drain', () => {
    write();
})

createWriteStream.on('finish', () => {
    console.timeEnd('write');
})

createWriteStream.on('close', () => {
    console.log('close reading')
})


