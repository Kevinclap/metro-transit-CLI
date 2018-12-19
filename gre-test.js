const axios = require('axios');
const moment = require('moment');

async function getNextBus() {

// Check the program is run with three arguments
if (process.argv.length != 5) {
    
    return console.log('Please enter 3 arguments!');
    
}

// Save command args in variables
let route = process.argv[2];
let stop = process.argv[3];
let direction = process.argv[4];

let url = 'http://svc.metrotransit.org/NexTrip/'

async function getInfo(url, key, value, arg) {
    try {
        const response = await axios.get(url);
        let data = response.data;

        for (item of data) {
            
            if (arg === item[key]) {
                return item[value];
            }
        }
      } catch (error) {
        console.error('This is error: ', error);
      }
}

// Calculate time until next bus arrival
async function getTime(dateString) {

    let timeStampString = dateString.substring(6,16);
    let timeStamp = moment(timeStampString, 'X').unix();
    let currentTime = moment().unix();
    let timeUntilNextBus = parseInt((timeStamp - currentTime) / 60);
    return timeUntilNextBus;

}

//Set the direction to expected String
if(direction === 'north') {
    direction = 'NORTHBOUND';
}
else if(direction === 'south') {
    direction = 'SOUTHBOUND';
}
else if(direction === 'east') {
    direction = 'EASTBOUND';
}
else if(direction === 'west') {
    direction = 'WESTBOUND';
}
else {
    return console.log('Invalid direction!');
}

// Find the routeId for route from args
let routesUrl = url + 'Routes?format=json';
let routeId = await getInfo(routesUrl, 'Description', 'Route', route);

// Kill process if route is not valid
if(!routeId) {
    return console.log(route + ' is not a valid route.')
}

// Find the directionId for direction from args
let directionsUrl = url + 'Directions/' + routeId + '?format=json';
let directionId = await getInfo(directionsUrl, 'Text', 'Value', direction);

// Kill process if direction is not valid
if(!directionId) {
    return console.log(route + ' doesn\'t go ' + direction);
}

// Find the stopId for stop from args
let stopsUrl = url + 'Stops/' + routeId + '/' + directionId + '?format=json';
let stopId = await getInfo(stopsUrl, 'Text', 'Value', stop);

// Kill process if stop is not valid
if(!stopId) {
    return console.log(stop + ' it\'s not a valid stop for route ' + route + ' ' + direction);
}

// Find TimeStamp string according to route, direction and stop id's
let timeUrl = url + routeId + '/' + directionId + '/' + stopId + '?format=json';
let time = await getInfo(timeUrl, 'RouteDirection', 'DepartureTime', direction);

// Kill process if time is not valid
if(!time) {
    return console.log('Could not get next connection');
}

// Calculate time until next bus
let timeUntilNextBus = await getTime(time);

if (timeUntilNextBus > 1) {
    return console.log('Next bus arriving in ', timeUntilNextBus, ' minutes.');
} else {
    return console.log('Next bus arriving in 1 minute or less');
};

}

// Call main function
getNextBus();
