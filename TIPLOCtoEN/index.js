//TIPLOC Eastings and Northings.xlsx.gz
//The CSV file with this package is from 2016, when latest update was issued. Should there be a new update at 
// https://wiki.openraildata.com/index.php?title=Identifying_Locations and the file at https://wiki.openraildata.com/index.php?title=File:TIPLOC_Eastings_and_Northings.xlsx.gz
// then decompress from gz to xlsx, then save as CSV in excel.

const fs = require("fs")
const path = require("path")

const base_file = path.join(__dirname, "./tiploc-northings-eastings.csv")

function convertCSVtoObj(csv){
    var rows = csv.split("\n")
    rows.shift() //get rid of title row
    rows = rows.map(row => {
        let [ TIPLOC, name, easting, northing ] = row.split(",")
        return { TIPLOC, name, easting, northing}
    })
    return rows
}

function decodeCSV(file){
    if(!file) file = base_file
    var contents = fs.readFileSync(file, "utf-8")
    return convertCSVtoObj(contents)
}

module.exports = decodeCSV
