const express = require('express')
const axios = require('axios').default;

const app = express()
const port = 3000
const APP_ID = "tfl_key"
const APP_KEY = "c918382153274eef95ca07f91a280c17"

class Bus {
    constructor(route, destination, timeToArrival) {
        this.route = route
        this.destination = destination
        this.timeToArrival = timeToArrival
    }
}

const sortBusesByTime = (busData) => {
    return busData.sort((a, b) => {
        return a.timeToStation - b.timeToStation
    })
}

const getPostCodeData = (postCode, res) => {
    axios.get(`https://api.postcodes.io/postcodes/${postCode}`)
        .then((response) => {
            getBusStopCodes([response.data.result.latitude, response.data.result.longitude], res)
        })
        .catch((error) => {
            console.log(error)
        })
}

const sortStopsByDistance = (stops) => {
    return stops.sort((a, b) => {
        return a.distance - b.distance
    })
}

const getBusStopCodes = (latAndLon, res) => {
    const [lat, lon] = latAndLon

    axios.get(`https://api.tfl.gov.uk/Stoppoint?lat=${lat}&lon=${lon}&stoptypes=NaptanBusCoachStation,NaptanPublicBusCoachTram&radius=500`)
        .then((response) => {
            const stopPoints = response.data.stopPoints
            const sortedStops = sortStopsByDistance(stopPoints)
            const nearestStops = sortedStops.slice(0, 2)
            let promises = []
            const busDeparturesJson = []

            for (let i = 0; i < nearestStops.length; i++) {
                promises.push(
                    getNextFiveBuses(nearestStops[i].naptanId)
                        .then((buses) => {
                            // busDeparturesJson[`${nearestStops[i].commonName}`] = buses
                            busDeparturesJson.push({ "Name" : nearestStops[i].commonName, "Distance": nearestStops[i].distance, "Departures": buses })
                        })
                )
            }

            Promise.all(promises).then(() => (res.send(busDeparturesJson)))
        })
        .catch((error) => {
            console.log(error)
        })
}

const getNextFiveBuses = (busStopCodes) => {
    return axios.get(`https://api.tfl.gov.uk/StopPoint/${busStopCodes}/Arrivals?app_id=${APP_ID}&app_key=${APP_KEY}`)
        .then((response) => {
            const sortedData = sortBusesByTime(response.data)
            const nextFiveBuses = sortedData.slice(0, 5)
            const buses = []

            nextFiveBuses.forEach((busData) => {
                const bus = new Bus(busData.lineName, busData.destinationName, busData.timeToStation)
                buses.push(bus)
            })

            return buses
        })
        .catch((error) => {
            console.log(error)
        })
}


app.use(express.static('frontend'));

app.get('/', (req, res) => {
    res.send('Hello World 2!')
})

app.get('/departureBoards', (req, res) => {
    let postCode = req.query.postcode
    getPostCodeData(postCode, res)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

