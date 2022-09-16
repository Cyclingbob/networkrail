const stompit = require("stompit")
const EventEmitter = require("events")

class Subscription {
    constructor(_client, topic){
        this._client = _client

        const headers = {
            destination: `/topic/${topic}`, // subscribe for a destination to which messages are sent
            "activemq.subscriptionName": "rtppmall",   // request a durable subscription - set this to an unique string for each feed
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
                    data.forEach(item => {
                        var keys = Object.keys(item)
                        var object = item[keys[0]]
                        console.log(object)
                        this.emitter.emit('movement', object)
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

class TD extends EventEmitter {
    constructor(email, password){
        super(email, password)
        this.email = email
        this.password = password

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
    subscribe(topic){
        return new Subscription(this._client, topic)
    }
    connect(){
        const connectionManager = new stompit.ConnectFailover([this._connectOptions], this._reconnectOptions)
        connectionManager.connect((err, client, reconnnect) => {
            this.reconnect = reconnnect
            this._client = client
            if(err) return this.emit('error', err)
            this._client.on('error', err => this.emit('error', err))
            this.emit('ready')
        })
        connectionManager.on('error', err => this.emit('error', err))
    }
    disconnect(){
        this._client.disconnect()
    }
}

TD.topics = {
    All: "TD_ALL_SIG_AREA",
    Scotland_East: "TD_SE_SIG_AREA",
    Scotland_West: "TD_SW_SIG_AREA",
    London_North_East: "TD_LNE_NE_SIG_AREA",
    East_Midlands: "TD_MC_EM_SIG_AREA",
    London_Great_Northern: "TD_LNE_GN_SIG_AREA",
    London_North_Western_Lancashire: "TD_LNW_LC_SIG_AREA",
    London_North_Western_Central: "TD_LNW_C_SIG_AREA",
    London_West_Midlands_Central: "TD_LNW_WMC_SIG_AREA",
    West_Coast_South: "TD_WCS_SIG_AREA",
    Anglia: "TD_ANG_SIG_AREA",
    Kent_And_Midlands: "TD_KENT_MCC_SIG_AREA",
    Sussex: "TD_SUSS_SIG_AREA",
    Wessex: "TD_WESS_SIG_AREA",
    Western_Thames_Valley: "TD_WTV_SIG_AREA",
    Western_West_Country: "TD_WWC_SIG_AREA",
    Western_Wales: "TD_WWM_SIG_AREA"
}

module.exports = TD
