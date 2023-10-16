const fs = require('fs')
const path = require('path')

function parse(data){
    data = data.split(/\r?\n/);
    var obj = {}
    for(var i = 0; i < data.length; i++){
        var item = data[i]
        var split = item.split('\t')
        obj[split[0]] = {
            code: split[0],
            cause: split[1],
            abbr: split[2] //abbreviation
        }
    }
    return obj
}

function parseFile(file){
    return(parse(fs.readFileSync(file, 'utf8')))
}

module.exports = {
    parseFile,
    parse,
    parsed: parseFile(path.join(__dirname, "./delaycodes.txt")),
    array: Object.values(parseFile(path.join(__dirname, "./delaycodes.txt")))
}