const CORPUS = require('./CORPUS')
const Schedule = require('./schedule')
const Smart = require('./SMART')
const TD = require('./TD')

class Client {
    constructor(email, password){
        this.email = email;
        this.password = password;
        this.Corpus = new CORPUS(this.email, this.password);
        this.Schedule = new Schedule(this.email, this.password);
        this.Smart = new Smart(this.email, this.password);
        this.TD = new TD(this.email, this.password);
    }
}

module.exports = Client
