# Network Rail
A collection of code for accessing the Network Rail  [data feeds](https://datafeeds.networkrail.co.uk "data feeds"). This service has limited capacity so if you create an account you will be placed onto the waiting list until capacity becomes available.

## Subscribing to the datafeeds
You can create an account [here](https://datafeeds.networkrail.co.uk "here").
Once you have an account, click `My Feeds` and on the left side there is a list of the available data feeds. Currently this github reposity only has written code for `TD` and `Schedule`, however no subscription is required for `SMART` or `CORPUS`

## Accessing the datafeeds
### Downloading
This collection of code is written for Node.js. You can install it [here](https://nodejs.org "here").

To download the code run `npm install https://github.com/Cyclingbob/networkrail`
This should work. I have tested it on windows. Please open an issue should this not be the case.
### Running

#### Creating your client
```javascript
const networkrail = require('networkrail')
const client = new networkrail("your datafeed email", "your data feed password")
```
#### Downloading the Schedule:
You can download the schedule to a file, or directly to memory, then read it.
The example below shows downloading to memory:

```javascript
const { type, day } = client.Schedule.types.All_Daily()
client.Schedule.downloadAndReturn(type, day, record => {
    if(!record.JsonScheduleV1) return
    record = record.JsonScheduleV1
    console.log(record)
})
```

#### Downloading the schedule to file:
```javascript
const path = require('path')
var { type, day } = client.Schedule.types.All_Daily()
client.Schedule.downloadToFile(type, day, path.join(__dirname, './schedule.json').then(() => {
	console.log('Downloaded')
}).catch(console.error)
```

#### Connecting to TD

```javascript
const TD = client.TD
TD.connect()
TD.on('error', console.log)
TD.on('ready', () => {
    console.log('ready')
    var subscription = TD.subscribe(client.TD_Topics.All)
    subscription.emitter.on('error', console.log)
    subscription.emitter.on('movement', movement => {
		console.log(movement)
    })
})
```

You can unsubscribe from a subscription by calling `subscription.unsubscribe()`.
You can disconnect the TD client by calling `TD.disconnect()`.

## Documentation

The full documentation is available [here](https://github.com/Cyclingbob/networkrail/blob/main/documentation.md "here").

## Glossary/Acronyms
- `TD`: Train Describer. This feed "provides low-level detail about the position of trains and their train reporting number through a network of berths" as described [here](https://wiki.openraildata.com//index.php?title=TD "here"). In short this feed allows you to track trains and their locations on a railway line.

- `Berth`: A space on the railway which can only have 1 train in it at a time. A railway line is made up of multiple berths which allow multiple trains to use the line at the same time. Berths are used to prevent trains colliding with each other as a train behind cannot enter an occupied berth. A train describer berth usually represents a signal. You can find out more [here](https://wiki.openraildata.com/index.php?title=TD_Berths "here").

- `SCHEDULE`: A datafeed which contains train schedules from Network Rail. The code on this repositry accesses the JSON feed. You can use the `SCHEDULE` feed to get information about a train service including its route and timing and other data. [This webpage](https://wiki.openraildata.com/index.php?title=Schedule_Records "This webpage") can help you understand the data.

- `SMART`: This is a database containing details of all the `TD` berths and allows movements to be translated into arrivals and departures from locations. When you recieve a train movement message from the TD data feed you can use SMART to work out the location of a train relative to stations and platforms and specific geographical locations by their `STANOX` code. More information about SMART [here](https://wiki.openraildata.com//index.php?title=Reference_Data#SMART:_Berth_Stepping_Data "here").

- `STANOX`: These codes can refer to non station locations such as siding and junctions and they are grouped by geographical area. A single location may have multiple codes representing it. [More here](https://wiki.openraildata.com/index.php?title=STANOX_Areas "More here")

- `CORPUS`: This is a database which you can use to to match location reference codes to location descriptions and other location reference codes. CORPUS can be used to search by `STANOX`, `TIPLOC`, `CRRS/3-Alpha` and [more types](https://wiki.openraildata.com/index.php?title=Reference_Data#CORPUS:_Location_Reference_Data "more types").

## Copyright
This code is protected under copyright. Unauthorised modification or redistribution is strictly prohibited. ©Cyclingbob 2022
