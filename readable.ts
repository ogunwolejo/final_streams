import {Readable, ReadableOptions} from 'node:stream'
import fs from 'fs';
import path from 'path';
import {Buffer} from 'node:buffer';

class ReadableStream extends Readable {
    private fn:string | undefined;
    private fd:number | undefined;

    constructor(sourceFile:string, options?:ReadableOptions) {
        super(options);
        this.fn = sourceFile;
    }

    _construct(callback: (error?: Error | null | undefined) => void): void {
        if(this.fn) {
            const dir:string = path.join(__dirname, this.fn);
            fs.open(dir, 'r', (err, fd:number) => {
                if(err) callback(err);
                this.fd = fd;
                callback();
            })
        } 
        else {
            const _error:Error = new Error('The File source does not exist');
            callback(_error);
        }
    }

    _read(size: number): void {
        const buff:Buffer = Buffer.alloc(size);
        if(this.fd) {
            fs.read(this.fd, buff, 0, size, null, (error, byteReads:number):void => {
                if(error) this.destroy();
                this.push(byteReads > 0 ? buff.subarray(0, byteReads) : null);
            })
        } 
    }

    _destroy(error: Error | null, callback: (error?: Error | null | undefined) => void): void {
        if(this.fd) {
            fs.close(this.fd, (err):void => callback(err || error));
        } 
        else {
            callback(error);
        } 
    }
}

export default ReadableStream;