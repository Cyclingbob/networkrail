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
            https.get(`https://publicdatafeeds.networkrail.co.uk/ntrod/SupportingFileAuthenticate?type=CORPUS`,
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
            this.downloadAndReturn(parsed => {
                resolve(parsed)
            })
        })
    }
    downloadAndFind(name){
        return new Promise(async (resolve, reject) => {
            var downloaded = await this.downloadAndReturnPromise().catch(reject)
            if(!downloaded) return reject('couldnt download')
            
            var found = this.find(name, downlaoded)
            if(found.error) reject(found.message)
            else resolve(found)
        })
    }
    find(name, cache){
        var NLCDESCFound = cache.find(a => a.NLCDESC === name)
        if(NLCDESCFound) return (NLCDESCFound)

        var NLCDESC16 = cache.find(a => a.NLCDESC16 === name)
        if(NLCDESC16) return (NLCDESC16)

        var STANOXFound = cache.find(a => a.STANOX === name)
        if(STANOXFound) return (STANOXFound)

        var TIPLOCFound = cache.find(a => a.TIPLOC === name)
        if(TIPLOCFound) return (TIPLOCFound)

        var CRSFound = cache.find(a => a["3ALPHA"] === name)
        if(CRSFound) return (CRSFound)

        var UICFound = cache.find(a => a.UIC === name)
        if(UICFound) return (UICFound)

        var NLCFound = cache.find(a => a.NLC === name)
        if(NLCFound) return (NLCFound)

        return {
            error: true,
            message: "could not find specified item"
        }
    }
}

module.exports = CORPUS