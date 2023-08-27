const EventEmitter = require("events")
const stompit = require("stompit")

const TD = require('./td')
const Trust = require('./trust')
const VSTP = require('./vstp')
const RTPPM = require('./rtppm')

class Connection extends EventEmitter {
    constructor(email, password){
        super(email, password)
        this.email = email
        this.password = password
        this.connected = false

        this._connectOptions = { //setup connection options
            host: "datafeeds.networkrail.co.uk",
            port: 61618,
            connectHeaders: {
                "heart-beat": "15000,15000", //heartbeat of 15 seconds
                "client-id": this.email, //durable subscription. If you get disconnected the server will save up to 5 mins of data until you reconnect again.
                host: "/",
                login: this.email,
                passcode: this.password
            }
        }

        this._reconnectOptions = { //setup reconnection options
            initialReconnectDelay: 10,    // milliseconds delay of the first reconnect
            maxReconnectDelay: 30000,     // maximum milliseconds delay of any reconnect
            useExponentialBackOff: true,  // exponential increase in reconnect delay
            maxReconnects: 30000,            // maximum number of failed reconnects consecutively
            randomize: false              // randomly choose a server to use when reconnecting       
        }
    }
    subscribeTD(topic){
        if(!this.connected) throw new Error("You need to use connection.connect() before subscribing.")
        return new TD.Subscription(this._client, topic)
    }
    subscribeTrust(topic){
        if(!this.connected) throw new Error("You need to use connection.connect() before subscribing.")
        return new Trust.Subscription(this._client, topic)
    }
    subscribeVSTP(){
        if(!this.connected) throw new Error("You need to use connection.connect() before subscribing.")
        return new VSTP.Subscription(this._client)
    }
    subscribeRTPPM(){
        if(!this.connected) throw new Error("You need to use connection.connect() before subscribing.")
        return new RTPPM.Subscription(this._client)
    }
    connect(callback){
        const connectionManager = new stompit.ConnectFailover([this._connectOptions], this._reconnectOptions)
        connectionManager.connect((err, client, reconnnect) => {
            this.reconnect = reconnnect
            this.connected = true
            this._client = client
            if(err) return this.emit('error', err)
            this._client.on('error', err => this.emit('error', err))
            this.emit('ready')
            if(callback) callback(client)
        })
        connectionManager.on('error', err => this.emit('error', err))
    }
    disconnect(){
        this._client.disconnect()
    }
}

module.exports = Connection