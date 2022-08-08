const config = require('./config')

const stompit = require("stompit");
const connectionManager = new stompit.ConnectFailover([config.stomp.connection], config.stomp.reconnect);

const uuid = require("uuid")

var berths = {}

function saveToBerths(data){
    if(data.msg_type === "CA"){
        if(!berths[data.area_id]) berths[data.area_id] = {}
        berths[data.area_id][data.to] = {
            occupied: true,
            train: data.descr,
            changed: parseInt(data.time)
        }
        berths[data.area_id][data.from] = {
            occupied: false,
            changed: parseInt(data.time)
        }
    }
}

connectionManager.connect(function (error, client, reconnect) {
    if (error) {
        console.log(error)
        console.log("Terminal error, gave up reconnecting");
        return;
    }

    client.on("error", (error) => {
        console.log(error)
        console.log("Connection lost. Reconnecting...");
        reconnect();
    });
    
    client.subscribe(config.stomp.subscription, function (error, message) {
        if (error) {
            console.log("Subscription failed:", error.message);
            return;
        }
        message.readString("utf-8", function (error, body) {
            if (error) {
                console.log("Failed to read a message", error);
                return;
            }
            if (body) {
                var data;
                try {
                    data = JSON.parse(body);
                    data.forEach(item => {
                        var keys = Object.keys(item)
                        var object1 = item[keys[0]]
                        saveToBerths(object1)
                    })
                } catch (e) {
                    console.log("Failed to parse JSON", e);
                    return;
                }
            }
            client.ack(message); // Send ACK frame to server
        });
    });
});

//you can access the berths using berths variable or run code with each message beneath line 55
