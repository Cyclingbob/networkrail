const fs = require('fs')
const url = require('url')
const https = require('https');
const zlib = require('zlib');

const Topics = {
    All_Daily: () => { return { type: "CIF_ALL_FULL_DAILY", day: "toc-full"}},
    Update_Daily(day){ return { type: "CIF_ALL_UPDATE_DAILY", day: "toc-update-" + day.toLowerCase().substring(0, 3)}},
    TOC_Daily(toc){ return { type: `CIF_${toc.ScheduleTOCCode}_TOC_FULL_DAILY`, day: "toc-full"}},
    TOC_Update_Daily(toc, day){ return { type: `CIF_${toc.ScheduleTOCCode}_TOC_UPDATE_DAILY`, day: "toc-update-" + day.toLowerCase().substring(0, 3)}},
    Freight_Daily: () => { return { type: "CIF_ALL_FULL_DAILY", day: "toc-full"}},
    Freight_Update_Daily(day){ return { type: "CIF_ALL_UPDATE_DAILY", day: "toc-update-" + day.toLoweCase().substring(0, 3)}},
}

class Schedule {
    constructor(email, password){
        this.email = email
        this.password = password
    }
    downloadToFile(type, day, fileName){
        return new Promise((resolve, reject) => {
            this.authenticate(type, day).catch(reject).then(headers => {
                const { host, path } = url.parse(headers.location)
                https.get({
                    host, path,
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
    authenticate(type, day, cif){
        if(!cif) var cif = false
        return new Promise((resolve, reject) => {
            https.get(`https://publicdatafeeds.networkrail.co.uk/ntrod/CifFileAuthenticate?type=${type}&day=${day}${cif ? ".CIF.gz" : ""}`,
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

        var stream = fs.createReadStream(fileName, {flags: 'r', encoding: 'utf-8'});
        var buf = '';
          
        stream.on('data', function(d) {
            buf += d.toString(); // when data is read, stash it in a string buffer
            pump(); // then process the buffer
        });

        function pump() {
            var pos;

            while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
                if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
                    buf = buf.slice(1); // discard it
                    continue; // so that the next iteration will start with data
                }
                processLine(buf.slice(0,pos)); // hand off the line
                buf = buf.slice(pos+1); // and slice the processed data off the buffer
            }
        }

        function processLine(line) { // here's where we do something with a line

            if (line[line.length-1] == '\r') line=line.substr(0,line.length-1); // discard CR (0x0D)

            if (line.length > 0) { // ignore empty lines
                var obj = JSON.parse(line); // parse the JSON
                callback(obj)
            }
        }
    }
    downloadAndReturn(type, day, callback, endcallback, error){
        this.authenticate(type, day, false).catch(error).then(headers => {
            const { host, path } = url.parse(headers.location)
            https.get({
                host, path,
            }, async res => {

                var unzip = zlib.createUnzip().on('error', error)
                var buf = ''

                res.pipe(unzip)
                .on('error', error)
                .on('data', d => {
                    buf += d.toString(); // when data is read, stash it in a string buffer
                    pump(); // then process the buffer
                }).on('end', () => { if(endcallback) endcallback(); });

                function pump() {
                    var pos;
        
                    while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
                        if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
                            buf = buf.slice(1); // discard it
                            continue; // so that the next iteration will start with data
                        }
                        processLine(buf.slice(0,pos)); // hand off the line
                        buf = buf.slice(pos+1); // and slice the processed data off the buffer
                    }
                }
        
                function processLine(line) { // here's where we do something with a line
        
                    if (line[line.length-1] == '\r') line=line.substr(0,line.length-1); // discard CR (0x0D)
        
                    if (line.length > 0) { // ignore empty lines
                        var obj = JSON.parse(line); // parse the JSON
                        callback(obj)
                        // } catch(e) { error(e) }                        
                    }
                }
                
            }).on('error', error)
        })
    }
    downloadAndReturnCIF(type, day, callback, endcallback, error){
        if(typeof callback !== "function") error("callback must be a function")
        if(typeof endcallback !== "function") error("endcallback must be a function")
        if(typeof error !== "function") error("error callback must be a function")

        this.authenticate(type, day, true).catch(error).then(headers => {
            const { host, path } = url.parse(headers.location)
            headers['Content-Type'] = ''
            https.get({
                host, path,
            }, async res => {
                var unzip = zlib.createUnzip().on('error', error)
                res.pipe(unzip)
                .on('error', error)
                .on('data', d => {
                    var split = d.toString().split('\n')
                    split.forEach(item => {
                        callback(item)
                    });
                }).on('end', endcallback)
            })
        })   
    }
    // downloadAndReturnCIFInBulk(type, day, callback, error){ //removed because memory is too much for js to handle
    //     if(typeof callback !== "function") error("callback must be a function")
    //     if(typeof error !== "function") error("error callback must be a function")

    //     this.authenticate(type, day, true).catch(error).then(headers => {
    //         const { host, path } = url.parse(headers.location)
    //         headers['Content-Type'] = ''
    //         https.get({
    //             host, path,
    //         }, async res => {
    //             var unzip = zlib.createUnzip().on('error', error)
    //             var buf = ""
    //             res.pipe(unzip)
    //             .on('error', error)
    //             .on('data', d => {
    //                 var split = d.toString()
    //                 console.log(split.length, buf.length)
    //                 buf += split
    //             })
    //             .on('end', () => callback(buf))
    //         })
    //     })   
    // }
}

module.exports = { Schedule, Topics }