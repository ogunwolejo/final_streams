import DuplexStream from "./duplex";
//import {pipeline} from 'node:stream'

const duplexStream = new DuplexStream('duplex-write.txt', 'read-stream.txt');

duplexStream.on('data', (chunk:Buffer) => {
    if(!duplexStream.write(chunk)) {
        duplexStream.pause();
    }
})

duplexStream.on('drain', () => {
    duplexStream.resume()
});

duplexStream.on('end', () => console.log('end of read stream'));
duplexStream.on('finish', () => console.log('finish of write stream'));
duplexStream.on('close', () => console.log('close !!'));