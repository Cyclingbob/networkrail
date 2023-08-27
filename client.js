const Connection = require('./connection')
const Corpus = require('./corpus')
const Schedule = require('./schedule').Schedule
const Smart = require('./smart')

class Client {
    constructor(e, p){ //e is email, p is password
        this.email = e
        this.password = p
        this.corpus = new Corpus(e,p)
        this.schedule = new Schedule(e,p)
        this.smart = new Smart(e,p)
        this.connection = new Connection(e,p)
    }
}

module.exports = Client