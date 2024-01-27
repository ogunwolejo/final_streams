import ReadableStream from "./readable";

//READABLE PART OF THE STREAM
const createReadableStream:ReadableStream = new ReadableStream('read-stream.txt'); // reading from
createReadableStream.on('data', (chunk:Buffer) => {
    console.log('## ', chunk.toString(), '\t', chunk);
})
createReadableStream.on('end', () => console.log('Reading chunk just ended'));
createReadableStream.on('close', () => console.log('Reading chunk just closed'))