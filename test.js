const networkrail = require('./module')
const client = new networkrail.Client("bob21567@yahoo.com", "Enterprise@123")

const connection = client.connection
connection.connect()
connection.on('ready', () => {
    var td = connection.subscribeTD(networkrail.Topics.TD.Anglia)
    td.emitter.on('movement', message => {
        console.log(message)
    })
})