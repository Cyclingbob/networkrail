const config = {
    stomp: {
        connection: {
            host: "datafeeds.networkrail.co.uk",
            port: 61618,
            connectHeaders: {
                "heart-beat": "15000,15000",
                "client-id": "YOUR DATA FEEDS EMAIL",
                host: "/",
                login: "YOUR DATA FEEDS EMAIL",
                passcode: "YOUR DATA FEEDS PASSWORD"
            }
        },
        reconnect: {
            initialReconnectDelay: 10,
            maxReconnectDelay: 30000,
            useExponentialBackOff: true,
            maxReconnects: 1000,
            randomize: false
        },
        subscription: {
            destination: "/topic/" + "YOUR SIGNALLING AREA CODE which you can find on the wiki: https://wiki.openraildata.com//index.php?title=TD",
            "activemq.subscriptionName": "movements",
            ack: "client-individual"
        }
    }
}

module.exports = config
