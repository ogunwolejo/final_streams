import {Writable, WritableOptions} from 'node:stream';
import fs from 'fs';
import path from 'path';

class WriteableStream extends Writable {
    private fd:number|undefined;
    private fn:string|undefined;
    private chunks:Array<Buffer> = [];
    private chunksLength:number = 0;

    constructor(destinationFile:string, options?: WritableOptions) {
        super(options);
        this.fn = destinationFile;
    }
    
    _construct(callback: (error?: Error | null | undefined) => void): void {
        if(this.fn) {
            fs.open(this.fn, 'w', (err, fd:number):void => {
                if(err) callback(err);
                this.fd = fd;
                callback();
            })
        }
        else {
            const _error:Error = new Error('The destination file does not exist');
            callback(_error);
        }
    }
    
    _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
        if(this.fd) {
            this.chunks.push(chunk);
            this.chunksLength += chunk.length;
            
            if(this.chunksLength > this.writableHighWaterMark) {
                fs.write(this.fd, Buffer.concat(this.chunks), undefined, this.chunksLength, undefined, (err):void => {
                    if(err) return callback(err);
                    this.chunks = [];
                    this.chunksLength = 0;
                    callback();
                })
            } 
            else {
                callback();
            }
        }
    }

    _final(callback: (error?: Error | null | undefined) => void): void {
        if(this.fd) {
            fs.write(this.fd, Buffer.concat(this.chunks), undefined, undefined, undefined, (err):void => {
                if(err) callback(err);

                this.chunks = [];
                this.chunksLength = 0;
                callback();
            });
        }
    }

    _destroy(error: Error | null, callback: (error?: Error | null | undefined) => void): void {
        if(this.fd) {
            fs.close(this.fd, (err) =>  callback(err || error));
        }
        else {
            const _error:Error = new Error('Cannot destroy because there was no file open');
            callback(_error);
        }
    }
}

export default WriteableStream;