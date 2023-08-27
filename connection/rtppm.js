const EventEmitter = require("events")
const { randomUUID } = require('crypto')

class Subscription {
    constructor(_client){
        this._client = _client
        this.id = randomUUID()

        const headers = {
            destination: `/topic/RTPPM_ALL`, // subscribe for a destination to which messages are sent
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
                    this.emitter.emit('message', data.RTPPMDataMsgV1)
                }
            })
        })
        this.id = this._subscription.getId()
    }
    unsubscribe(){
        this._subscription.unsubscribe()
    }
}

module.exports = { Subscription }