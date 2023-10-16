const TD_Topics = require('./connection/td').Topics
const Trust_Topics = require('./connection/trust').Topics
const Schedule_Topics = require('./schedule').Topics
const operators = require('./schedule/operators')
const Client = require('./client')

module.exports = {
    Client,
    Topics: {
        TD: TD_Topics,
        Trust: Trust_Topics,
        Schedule: Schedule_Topics,
    },
    operators,
    cif_codes: require('./cifcodes'),
    delay_codes: require("./delaycodes"),
    TIPLOC_to_EN: require("./TIPLOCtoEN") //tiplocs to easting northing and name
}