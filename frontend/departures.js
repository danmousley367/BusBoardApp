const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let xhttp = new XMLHttpRequest();

const handleSubmit = () => {
    console.log("works")
    xhttp.open('GET', 'http://localhost:3000/departureBoards?postcode=nw51tl', true);

    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onload = function () {
        // Handle response here using e.g. xhttp.status, xhttp.response, xhttp.responseText
        const data = JSON.parse(xhttp.responseText)
        console.log(data)
        const getDepartures = (departures) => {
            let departureList = ""
            for (let i = 0; i < departures.length; i++) {
                departures += `<li>${departures[i].timeToStation}: ${departures[i].lineName} to ${departures[i].destinationName}</li>`
            }
            return departureList
        }
        const getResults = () => {
            let results = ""
            for (let i = 0; i < data.length; i++) {
                results += `
                <h3>${data[i].Name}. ${data[i].Distance} away</H3>
                <ul>
                    ${getDepartures(data[i].departures)}
                </ul>
                `
            }
            return results
        }
        document.getElementById("results").innerHTML = `
        <h2>Results</h2>
        ${getResults()}
        `
    }

    xhttp.send();
}