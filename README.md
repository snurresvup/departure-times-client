# Departure times service
The service in this repository, and the two accompanying repositories
[/departure-times-api](https://github.com/snurresvup/departure-times-api) and [/websocketArrivalTimes](https://github.com/snurresvup/websocketArrivalTimes)
construct a web service providing live arrival times for the London buses.

The system uses the [Transport for London Unified API](https://api.tfl.gov.uk/) (tfl), to obtain information about the locations of bus stops, and the expected arrivals of buses at these stops.

The system is constructed from three parts: React frontend, Dropwizard REST API and a websocket compnent.

## Frontend
A [React js](https://facebook.github.io/react/) frontend app that is built with [create-react-app](https://github.com/facebookincubator/create-react-app), and uses [google-maps-react](https://www.npmjs.com/package/google-maps-react) to display locations of bus stops and the user. To provide a search functionality to find a specific bus stop by name the frontedn app uses [react-bootstrap-typeahead](https://www.npmjs.com/package/react-bootstrap-typeahead).

## API [(/departure-times-api)](https://github.com/snurresvup/departure-times-api)
The API part of the system is built with [Dropwizard.io](http://www.dropwizard.io/), and functions as a middleware between the React app and the tfl api. When the API component is initially launched, it downloads data from (tfl) about the locations of all of the bus stops in London and stores the information in a [MongoDB](https://www.mongodb.com/). When before storing the data in the MongoDB the API modifies the data, such that it contains GeoJSON as location information. I have added a "2dsphere" index on the documents in the database in order to make Geospacial queries on the bus stops.

## Websocket server [(/websocketArrivalTimes)](https://github.com/snurresvup/websocketArrivalTimes)
A small websocket server has been created in java and is served by [Glassfish](https://javaee.github.io/glassfish/). This websocket provides live updates to the frontend, by pushing messages containing arrival information for the currently selected stop, approximately every 5 seconds.
The frontend can send a message of the form "currentStopId:*stopID*" to update the stop for which to receive arrival time info for.

The websocket component requests updates from the API continuously, to get the most recent arrival times info.

This component has been created because it wasn't possible for me to get the stream of arrival information from (tfl), as it requires IP-whitelisting. Thus to get similar functionality, i decided to experiment with constructing a websocket.

## Deployment
