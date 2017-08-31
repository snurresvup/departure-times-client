# Departure times service
The service in this repository and the accompanying repository
[/departure-times-api](https://github.com/snurresvup/departure-times-api)
construct a web service providing live arrival times for the London buses.

The system uses the [Transport for London Unified API](https://api.tfl.gov.uk/) (tfl), to obtain information about the locations of bus stops and the expected arrivals of buses at these stops.

The system is constructed from two parts: a React js frontend and a Dropwizard REST API.

Most focus has been put into functionality of the system and thus less emphasis has been put on security and design of the frontend.

## Frontend
A [React js](https://facebook.github.io/react/) frontend app that is built with [create-react-app](https://github.com/facebookincubator/create-react-app) and uses [google-maps-react](https://www.npmjs.com/package/google-maps-react) to display locations of bus stops and the user. To provide a search functionality to find a specific bus stop by name, the frontend app uses [react-bootstrap-typeahead](https://www.npmjs.com/package/react-bootstrap-typeahead).

The when a stop is selected in the frontend, the frontend continuously requests updates from the API, to get the most recent arrival times info.

This construction of continuous pulling has been created because it wasn't possible for me to get the stream of arrival information from (tfl), as it requires IP-whitelisting. Thus to get similar functionality, I decided to request updates at fixed intervals of 5 seconds.

## API [(/departure-times-api)](https://github.com/snurresvup/departure-times-api)
The API part of the system is built with [Dropwizard.io](http://www.dropwizard.io/) and functions as a middleware between the React app and the tfl api. When the API component is initially launched, it downloads data from tfl about the locations of all of the bus stops in London and stores the information in a [MongoDB](https://www.mongodb.com/), to be able to deliver it faster when requested. Before storing the data in the MongoDB, the API modifies the data such that it contains GeoJSON as location information. I have added a "2dsphere" index on the documents in the database in order to make Geospatial queries on the bus stops.

## Deployment
The system is deployed at IP: 178.62.31.37 and can only be viewed through https, as the system requires positioning information about the user. The server is hosted by [DigitalOcean](https://www.digitalocean.com/).
The API part of the system is listening on port 8080, and the client interface is is listening on port 5000.

Because the app uses the location of the user, which can only be obtained through a secure connection. Thus both the API and the frontend is served using self signed certificates. Thus, when viewing the app, one must instruct the browser to accept the self signed certificate.

## Problems
When building the system, I have run into several issues regarding the documentation of the tfl api.
One of these being that the api offers 3 different ways to get arrival predictions, and the two that was available to me was not consistent with the rest of the data provided by the api.

One of the endpoints delivers a long list of arrays, with each array containing a number, a line name, a station name and a timestamp representing the arrival prediction. The other option delivers arrival prediction for a specific stop id. For the system constructed, I settled for using the later endpoint, as there are multiple stops with the same name, so the first option does not give a clear indication of what stop the line will be arriving at.

The endpoint providing the arrival predictions does not have information for all stop ids and thus, some of the bus stops presented in the application has no arrival data to display.

### Choice of architecture
I have chosen Dropwizard as backend, based on its positive reputation for building REST apis. The same goes for the React frontend, as it provides a good foundation for keeping track of state in a reactive frontend. Initially I wanted the frontend to get the stream of arrival information from tfl directly, but as mentioned this turned out not to be an option. This is why, I chose to construct a websocket server, such that the dropwizard REST api is kept state free.

Besides showing some of my capabilities in coding, I have seen this project as an opportunity to try out some technologies which I haven't worked with before. So this has been my first time working with React js, Dropwizard and Websockets.

## Future work
If more time was provided, more work would go into thoroughly testing the service and its sub components. As well as constructing health checks for the dropwizard application. This would also lead to programming the services in a more defensive way, to make the system more robust.
For instance a known problem, is that the Docker container running the API component crashes every now and then, but restarts immediately. This may be caused by performance issues at the droplet the system is running on.
