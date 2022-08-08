const fs = require('fs')
const url = require('url')
const https = require('https');
const { ungzip } = require('node-gzip');
const zlib = require('zlib');

const operators = require('./operators')

class Schedule {
    constructor(email, password){
        this.email = email
        this.password = password
        this.types = {
            All_Daily: () => { return { type: "CIF_ALL_FULL_DAILY", day: "toc-full"}},
            Update_Daily(day){ return { type: "CIF_ALL_UPDATE_DAILY", day: "toc-update-" + day.toLoweCase().substring(0, 3)}},
            TOC_Daily(toc){ return { type: `CIF_${toc.ScheduleTOCCode}_TOC_FULL_DAILY`, day: "toc-full"}},
            TOC_Update_Daily(toc, day){ return { type: `CIF_${toc.ScheduleTOCCode}_TOC_UPDATE_DAILY`, day: "toc-update-" + day.toLowerCase().substring(0, 3)}},
            Freight_Daily: () => { return { type: "CIF_ALL_FULL_DAILY", day: "toc-full"}},
            Freight_Update_Daily(day){ return { type: "CIF_ALL_UPDATE_DAILY", day: "toc-update-" + day.toLoweCase().substring(0, 3)}},
        }
        this.TOCs = operators.parsedWithSuitableNames
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
    authenticate(type, day){
        return new Promise((resolve, reject) => {
            https.get(`https://datafeeds.networkrail.co.uk/ntrod/CifFileAuthenticate?type=${type}&day=${day}`,
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
    downloadAndReturn(type, day, callback, endcallback){
        this.authenticate(type, day).catch(console.log).then(headers => {
            const { host, path } = url.parse(headers.location)
            headers['Content-Type'] = ''
            https.get({
                host, path,
            }, async res => {

                var unzip = zlib.createUnzip();
                var buf = ''

                res.pipe(unzip).on('data', d => {
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
                    }
                }
                
            })
        })
    }
}

module.exports = Schedule
