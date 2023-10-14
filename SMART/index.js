const fs = require('fs')
const url = require('url')
const https = require('https');
// const { ungzip } = require('node-gzip');
const zlib = require('zlib');

class SMART {
    constructor(email, password){
        this.email = email
        this.password = password
    }
    downloadToFile(fileName){
        return new Promise((resolve, reject) => {
            this.authenticate().catch(reject).then(headers => {
                const { host, path } = url.parse(headers.location)
                https.get({
                    host, path
                }, async function(res){
                    var unzip = zlib.createUnzip().on('error', reject)
                    var writeStream = fs.createWriteStream(fileName)

                    res.pipe(unzip).pipe(writeStream)
                    .on('error', reject)
                    .on('finish', resolve)
                })
            })
        })
    }
    authenticate(){
        return new Promise((resolve, reject) => {
            https.get(`https://publicdatafeeds.networkrail.co.uk/ntrod/SupportingFileAuthenticate?type=SMART`,
                {
                    headers: {
                        Authorization: 'Basic ' + Buffer.from(`${this.email}:${this.password}`).toString('base64')
                    },
                },
                res => {
                    if(res.statusCode > 300 && res.statusCode < 400 && res.headers.location) resolve(res.headers)
                    else reject(res.statusMessage)
                }
            )
        })
    }
    read(fileName, callback){
        var data = fs.readFileSync(fileName).toString()
        var parsed = JSON.parse(data)
        if(callback) callback(parsed)
        return parsed
    }
    readPromise(fileName){
        return new Promise((resolve, reject) => {
            this.read(fileName, (content) => {
                resolve(content)
            })
        })
    }
    downloadAndReturn(callback){
        this.authenticate().catch(console.log).then(headers => {
            const { host, path } = url.parse(headers.location)
            https.get({
                host, path,
            }, async res => {

                var unzip = zlib.createUnzip();
                var total = ''

                var writableStream = new require('stream').Writable()                
                writableStream._write = (chunk, encoding, next) => {
                    total += chunk.toString()
                    next();
                };
                res.pipe(unzip).pipe(writableStream)
                writableStream.on('finish', () => {
                    callback(JSON.parse(total).BERTHDATA)
                })
            })
        })
    }
    downloadAndReturnPromise(){
        return new Promise((resolve, reject) => {
            this.downloadAndReturn(function done(parsed){
                resolve(parsed)
            })
        })
    }
}

module.exports = SMART