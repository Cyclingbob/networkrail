const EventEmitter = require("events")
const { randomUUID } = require('crypto')

class Subscription {
    constructor(_client, topic){
        this._client = _client
        this.id = randomUUID()

        const headers = {
            destination: `/topic/${topic}`, // subscribe for a destination to which messages are sent
            "activemq.subscriptionName": this.id,   // request a durable subscription - set this to an unique string for each feed
            ack: "client-individual"               // the client will send ACK frames individually for each message processed
        };
        
        this.emitter = new EventEmitter()
        
        this._subscription = this._client.subscribe(headers, (err, message) => {
            if(err) return this.emitter.emit('error', err)
            
            message.readString('utf-8', (err, body) => {
                if(err) return this.emitter.emit('error', err)
                if(body){
                    var data;
                    try {
                        data = JSON.parse(body);
                    } catch (e) {
                        return this.emitter.emit('error', e)
                    }
                    if(data) data.forEach(message => {
                        this.emitter.emit('message', message)
                    })
                }
            })
        })
        this.id = this._subscription.getId()
    }
    unsubscribe(){
        this._subscription.unsubscribe()
    }
}

const Topics = {
    All: "TRAIN_MVT_ALL_TOC",
    Freight: "TRAIN_MVT_FREIGHT",
    FreightChangeOfIdentity: "TRAIN_MVT_GENERAL",
    TOC(toc){
        var code = toc.TrustCode
        return `TRAIN_MVT_${code}_TOC`
    }
}

module.exports = { Subscription, Topics }