// const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let xhttp = new XMLHttpRequest();

const handleSubmit = () => {
    let postCode = document.getElementById("postCode").value
    xhttp.open('GET', `http://localhost:3000/departureBoards?postcode=${postCode}`, true);

    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onload = function () {
        // Handle response here using e.g. xhttp.status, xhttp.response, xhttp.responseText
        const data = JSON.parse(xhttp.responseText)
        const getDepartures = (departures) => {
            let departureList = ""
            for (let i = 0; i < departures.length; i++) {
                departureList += `<li>${Math.round(departures[i].timeToArrival / 60)} minutes: ${departures[i].route} to ${departures[i].destination}</li>`
            }
            return departureList
        }
        const getResults = () => {
            let results = ""
            for (let i = 0; i < data.length; i++) {
                results += `
                <h3>${data[i].Name} (${data[i].Distance.toFixed(2)}m away):</H3>
                <ul>
                    ${getDepartures(data[i].Departures)}
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