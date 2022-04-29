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

const getPostCodeData = (postCode) => {
    return axios.get(`https://api.postcodes.io/postcodes/${postCode}`)
        .then((response) => {
            const buses = getBusStopCodes([response.data.result.latitude, response.data.result.longitude])
            return buses
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

const getBusStopCodes = (latAndLon) => {
    const [lat, lon] = latAndLon

    return axios.get(`https://api.tfl.gov.uk/Stoppoint?lat=${lat}&lon=${lon}&stoptypes=NaptanBusCoachStation,NaptanPublicBusCoachTram&radius=500`)
        .then((response) => {
            const stopPoints = response.data.stopPoints
            const sortedStops = sortStopsByDistance(stopPoints)
            const nearestStops = sortedStops.slice(0, 2)

            return Promise.all(nearestStops.map(nearestStop => {
                return getNextFiveBuses(nearestStop.naptanId)
                    .then((buses) => {
                        console.log(buses)
                        return { "Name": nearestStop.commonName, "Distance": nearestStop.distance, "Departures": buses }
                    })
            }))

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

            const buses = nextFiveBuses.map((busData) => {
                return new Bus(busData.lineName, busData.destinationName, busData.timeToStation)
            })

            return buses
        })
        .catch((error) => {
            console.log(error)
        })
}

app.use(express.static('frontend'));
app.use('/history', express.static('frontend/history.html'))

app.get('/', (req, res) => {
    res.send('Hello World 2!')
})

app.get('/departureBoards', async (req, res) => {
    let postCode = req.query.postcode
    const busDeparturesJson = await getPostCodeData(postCode)
    res.send(busDeparturesJson)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

