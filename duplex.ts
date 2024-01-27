import {Duplex, DuplexOptions} from 'node:stream'
import fs from 'fs';
import path from 'path';
import {Buffer} from 'node:buffer'; 


class DuplexStream extends Duplex {
    private readFile:string|undefined;
    private writeFile:string|undefined;
    private readFileFd:number|undefined;
    private writeFileFd:number|undefined;
    private chunks:Array<Buffer> = [];
    private chunksLength:number = 0;

    constructor(wFile:string, rFile:string, option?:DuplexOptions) {
        super(option);
        this.readFile = rFile;
        this.writeFile = wFile;
    }

    _construct(callback: (error?: Error | null | undefined) => void): void {
        if(this.readFile && this.writeFile) {
            const writeDir:string = path.join(__dirname, this.writeFile);
            const readDir:string = path.join(__dirname, this.readFile);
            
            fs.open(readDir, 'r', (err, fd:number):void => {
                if(err) callback(err);
                this.readFileFd = fd;

                fs.open(writeDir, 'w', (err, fd:number):void => {
                    if(err) callback(err);
                    this.writeFileFd = fd;
                    callback();
                });
            });
        }
        else {
            const _error:Error = new Error('Either the read or source file is not available!!');
            callback(_error);
        }
    }

    _read(size: number): void {
        const buff:Buffer = Buffer.alloc(size);
        if(this.readFileFd) {
            fs.read(this.readFileFd, buff, 0, size, null, (error, byteReads:number):void => {
                if(error) this.destroy();
                this.push(byteReads > 0 ? buff.subarray(0, byteReads) : null);
            })
        }
    }

    _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
        if(this.writeFileFd) {
            this.chunks.push(chunk);
            this.chunksLength += chunk.byteLength
            
            if(this.chunksLength > this.writableHighWaterMark) {
                fs.write(this.writeFileFd, Buffer.concat(this.chunks), undefined, null, undefined, (err):void => {
                    if(err) return callback(err);
                    this.chunks = [];
                    callback();
                })
            } 
            else {
                callback();
            }
        }
    }

    _final(callback: (error?: Error | null | undefined) => void): void {
        if(this.writeFileFd) {
            fs.write(this.writeFileFd, Buffer.concat(this.chunks), undefined, undefined, undefined, (err):void => {
                if(err) callback(err);

                this.chunks = [];
                this.chunksLength = 0;
                callback();
            });
        }
    }

    _destroy(error: Error | null, callback: (error?: Error | null | undefined) => void): void {
        if(this.readFileFd) {
            fs.close(this.readFileFd, (err):void => {
                if(err) callback(err || error);

                // close the write file
                if (this.writeFileFd) {
                    fs.close(this.writeFileFd, (err):void => {
                        if(err) callback(err || error);
                        callback();
                    })
                }
            })
            
        }
        else {
            const _error:Error = new Error('Cannot close files due to the unavailability of the read or source file is not available!!');
            callback(_error);
        }
    }
}

export default DuplexStream;