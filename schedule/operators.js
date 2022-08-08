const fs = require('fs')
const path = require('path')

function parse(file){
    var data = fs.readFileSync(file, 'utf8')
    data = data.split(/\r?\n/);
    var obj = {}
    for(var i = 0; i < data.length; i++){
        if(i !== 0){
            var keys = data[0].split('\t')
            var split = data[i].split('\t')
            obj[split[0].replace(' ', '')] = {}
            for(var j = 0; j < keys.length; j++){
                obj[split[0].replace(' ', '')][keys[j].replace(' ', '')] = split[j]
            }
        }
    }
    return obj
}

function parseWithSuitableNames(file){
    var data = fs.readFileSync(file, 'utf8')
    data = data.split(/\r?\n/);
    var obj = {}
    for(var i = 0; i < data.length; i++){
        if(i !== 0){
            var keys = data[0].split('\t')
            var split = data[i].split('\t')
            obj[split[0].replace(' ', '')] = {}
            for(var j = 0; j < keys.length; j++){
                var key = keys[j].replace(' ', '')
                if(key === "CompanyName") key = "Company"
                if(key === "BusinessCode") key="TrustCode"
                if(key === "SectorCode") key="TrustTOCCode"
                if(key === "ATOCCode") key="ScheduleTOCCode"
                obj[split[0].replace(' ', '')][key] = split[j]
            }
        }
    }
    return obj
}

function write(file, data){
    fs.writeFileSync(file, JSON.stringify(data), 'utf8')
}

module.exports = {
    parseFile: parse,
    parsed: parse(path.join(__dirname, './operators.txt')),
    parseWithSuitableNames,
    parsedWithSuitableNames: parseWithSuitableNames(path.join(__dirname, './operators.txt')),
    write //save file
}
