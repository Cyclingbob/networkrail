const fs = require('fs')
const url = require('url')
const https = require('https');
const { ungzip } = require('node-gzip');
const zlib = require('zlib');

class CORPUS {
    constructor(email, password){
        this.email = email
        this.password = password
    }
    downloadToFile(type, day, fileName){
        return new Promise((resolve, reject) => {
            this.authenticate(type, day).catch(reject).then(headers => {
                const { host, path } = url.parse(headers.location)
                headers['Content-Type'] = ''
                https.get({
                    host, path,
                    headers
                }, async function(data){
                    var stream = fs.createWriteStream(__dirname + '/download.gzip')
                    data.pipe(stream);
                    stream
                        .on('finish', async () => {
                            fs.writeFile(fileName, await ungzip(fs.readFileSync(__dirname + '/download.gzip')), function(){
                                resolve()
                            })
                        })
                        .on('error', reject)
                })
            })
        })
    }
    authenticate(){
        return new Promise((resolve, reject) => {
            https.get(`https://datafeeds.networkrail.co.uk/ntrod/SupportingFileAuthenticate?type=CORPUS`,
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
                    callback(JSON.parse(total).TIPLOCDATA)
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
    find(name){
        return new Promise(async (resolve, reject) => {
            var downloaded = await this.downloadAndReturnPromise().catch(reject)
            if(!downloaded) return reject('couldnt download')
            
            var NLCDESCFound = downloaded.find(a => a.NLCDESC === name)
            if(NLCDESCFound) return resolve(NLCDESCFound)

            var NLCDESC16 = downloaded.find(a => a.NLCDESC16 === name)
            if(NLCDESC16) return resolve(NLCDESC16)

            var STANOXFound = downloaded.find(a => a.STANOX === name)
            if(STANOXFound) return resolve(STANOXFound)

            var TIPLOCFound = downloaded.find(a => a.TIPLOC === name)
            if(TIPLOCFound) return resolve(TIPLOCFound)

            var CRSFound = downloaded.find(a => a["3ALPHA"] === name)
            if(CRSFound) return resolve(CRSFound)

            var UICFound = downloaded.find(a => a.UIC === name)
            if(UICFound) return resolve(UICFound)

            var NLCFound = downloaded.find(a => a.NLC === name)
            if(NLCFound) return resolve(NLCFound)
        })
    }
}

module.exports = CORPUS
