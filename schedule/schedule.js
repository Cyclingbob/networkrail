const fetch = require('node-fetch')
const fs = require('fs')
const url = require('url')
const http = require('https');
const { ungzip } = require('node-gzip');
const config = require('../../config.js')

fetch(`https://datafeeds.networkrail.co.uk/ntrod/CifFileAuthenticate?type=CIF_ALL_FULL_DAILY&day=toc-full`, {
    headers: {
        Authorization: 'Basic ' + Buffer.from(`${config.email}:${config.password}`).toString('base64')
    },
    redirect: 'manual'
}).then(data => {
    http.get({
        host: url.parse(data.headers.get('location')).host,
        path: url.parse(data.headers.get('location')).path,
        headers: data.headers
    }, async function(data){
        var stream = fs.createWriteStream(__dirname + '/data.gzip')
        data.pipe(stream);
        stream.on('finish', async () => {
            fs.writeFile(__dirname + "/schedule2.txt", await ungzip(fs.readFileSync(__dirname + '/data.gzip')), function(){
                console.log('parsing')

                var stream = fs.createReadStream(__dirname + '/schedule2.txt', {flags: 'r', encoding: 'utf-8'});
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
                        console.log(obj); // There's a lot of data, 
                    }
                }

            })
        })
    })
})
