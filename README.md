# Network Rail
A collection of code for accessing the Network Rail  [data feeds](https://datafeeds.networkrail.co.uk "data feeds"). This service has limited capacity so if you create an account you will be placed onto the waiting list until capacity becomes available. There is a lot of platform jargon for this repository so reference the [glossary](#glossaryacronyms) if you don't understand a term

## Subscribing to the datafeeds
You can create an account [here](https://datafeeds.networkrail.co.uk "here").
As of January 2023 you no longer need to take any action in order to subscribe to any of the feeds.

## Accessing the datafeeds
### Downloading
This collection of code is written for Node.js. You can install it [here](https://nodejs.org "here").

To download the code run `npm install https://github.com/Cyclingbob/networkrail` or download a zip of all the files by pressing the green "code" button and then running `npm install` to download the depedencies.

### Running

#### Creating your client
```javascript
const networkrail = require('networkrail')
const client = new networkrail("your datafeed email", "your data feed password")
```

#### Connecting to the messaging feeds

The datafeeds platform contains a wide range of messaging feeds including Train Describer, TRUST and VSTP (very short term plan scheduling). For all topics, refer to the [documentation](#documentation)

```javascript
const connection = client.connection //access the connection object
connection.connect() //connect
connection.on('ready', () => { //wait for connection to succeed
    //td stands for train describer (TD)
    var td = connection.subscribeTD(networkrail.Topics.TD.Anglia) //subscribe to a topic
    td.emitter.on('message', message => { //listen for messages. These describe train movements and signalling messages
        console.log(message)
    })
    td.emitter.on('error', err => { //print errors to console
        console.error(err)
    })
})
```
You can unsubscribe from a subscription by calling `td.unsubscribe()`.
You can disconnect the client's connection by calling `connection.disconnect()`.

#### Downloading the Schedule:
You can download the schedule to a file, or directly to memory, then read it.
The example below shows downloading to memory:

```javascript
const { type, day } = networkrail.Topics.Schedule.All_Daily()
client.Schedule.downloadAndReturn(type, day, record => {
    if(!record.JsonScheduleV1) return
    record = record.JsonScheduleV1
    console.log(record)
})
```

#### Downloading the schedule to file:
```javascript
const path = require('path')
const { type, day } = networkrail.Topics.Schedule.All_Daily()
client.Schedule.downloadToFile(type, day, path.join(__dirname, './schedule.json').then(() => {
	console.log('Downloaded')
}).catch(console.error)
```

## Documentation

The full documentation is available [here](https://github.com/Cyclingbob/networkrail/wiki "here").

## Glossary/Acronyms
- `TD`: Train Describer. This feed "provides low-level detail about the position of trains and their train reporting number through a network of berths" as described [here](https://wiki.openraildata.com//index.php?title=TD "here"). In short this feed allows you to track trains and their locations on a railway line.

- `Berth`: A space on the railway which can only have 1 train in it at a time. A railway line is made up of multiple berths which allow multiple trains to use the line at the same time. Berths are used to prevent trains colliding with each other as a train behind cannot enter an occupied berth. A train describer berth usually represents a signal. You can find out more [here](https://wiki.openraildata.com/index.php?title=TD_Berths "here").

- `SCHEDULE`: A datafeed which contains train schedules from Network Rail. The code on this repositry accesses the JSON feed. You can use the `SCHEDULE` feed to get information about a train service including its route and timing and other data. [This webpage](https://wiki.openraildata.com/index.php?title=Schedule_Records "This webpage") can help you understand the data.

- `SMART`: This is a database containing details of all the `TD` berths and allows movements to be translated into arrivals and departures from locations. When you recieve a train movement message from the TD data feed you can use SMART to work out the location of a train relative to stations and platforms and specific geographical locations by their `STANOX` code. More information about SMART [here](https://wiki.openraildata.com//index.php?title=Reference_Data#SMART:_Berth_Stepping_Data "here").

- `STANOX`: These codes can refer to non station locations such as siding and junctions and they are grouped by geographical area. A single location may have multiple codes representing it. [More here](https://wiki.openraildata.com/index.php?title=STANOX_Areas "More here")

- `CORPUS`: This is a database which you can use to to match location reference codes to location descriptions and other location reference codes. CORPUS can be used to search by `STANOX`, `TIPLOC`, `CRRS/3-Alpha` and [more types](https://wiki.openraildata.com/index.php?title=Reference_Data#CORPUS:_Location_Reference_Data "more types").

## Copyright
The content of this repositry including documentation and code is protected under the Copyright and Patents Act 1988. Permission is granted to use this content in its original form only. Permission is not granted to redistribute identical or modified copies except in circumstances where it is considered fair use or where explicit permission has been granted by the creator of the content.
