# Departure times service
The service in this repository and the two accompanying repositories
[/departure-times-api](https://github.com/snurresvup/departure-times-api) and [/websocketArrivalTimes](https://github.com/snurresvup/websocketArrivalTimes)
construct a web service providing live arrival times for the London buses.

The system uses the [Transport for London Unified API](https://api.tfl.gov.uk/) (tfl), to obtain information about the locations of bus stops and the expected arrivals of buses at these stops.

The system is constructed from three parts: React frontend, Dropwizard REST API and a websocket compnent.

Most focus has been put into functionality of the system and thus less emphasis has been put on security and design of the frontend.

## Frontend
A [React js](https://facebook.github.io/react/) frontend app that is built with [create-react-app](https://github.com/facebookincubator/create-react-app) and uses [google-maps-react](https://www.npmjs.com/package/google-maps-react) to display locations of bus stops and the user. To provide a search functionality to find a specific bus stop by name, the frontend app uses [react-bootstrap-typeahead](https://www.npmjs.com/package/react-bootstrap-typeahead).

## API [(/departure-times-api)](https://github.com/snurresvup/departure-times-api)
The API part of the system is built with [Dropwizard.io](http://www.dropwizard.io/) and functions as a middleware between the React app and the tfl api. When the API component is initially launched, it downloads data from tfl about the locations of all of the bus stops in London and stores the information in a [MongoDB](https://www.mongodb.com/), to be able to deliver it faster when requested. Before storing the data in the MongoDB, the API modifies the data such that it contains GeoJSON as location information. I have added a "2dsphere" index on the documents in the database in order to make Geospatial queries on the bus stops.

## Websocket server [(/websocketArrivalTimes)](https://github.com/snurresvup/websocketArrivalTimes)
A small websocket server has been created in java and is served by [Glassfish](https://javaee.github.io/glassfish/). This websocket provides live updates to the frontend, by pushing messages containing arrival information for the currently selected stop, approximately every 5 seconds.
The frontend can send a message of the form "currentStopId:*stopID*" to update the stop for which to receive arrival time info.

The websocket component requests updates from the API continuously, to get the most recent arrival times info.

This component has been created because it wasn't possible for me to get the stream of arrival information from (tfl), as it requires IP-whitelisting. Thus to get similar functionality, i decided to experiment with constructing a websocket.

## Deployment
The system is only partially deployed (the reason will follow). The API, websocket component and the MongoDB is deployed at a [DigitalOcean](https://www.digitalocean.com/) droplet at IP: 178.62.31.37
with the API listening on port 8080, and the websocket on port 8082.

Clearly I would have wanted to deploy the frontend component to the server as well, however I ran into problems that I could not solve. The problem being that the React app in the frontend uses the users location, which is only available in "safe contexts" (from Chrome 50). To handle this i changed the API and frontend to use self signed certificates and https, however I found that I could not get the websocket component to communicate via wss, as is required when the connection is established by a page viewed through https.

## Running the code
The code must be run locally (the reason is in the Deployment section). And requires npm.

There are two possible ways to run the project: By running it in development mode, or by building the project and serving it with a static server.

### To run the project in development mode:
- Pull the code from this repository:
```shell
$ git clone https://github.com/snurresvup/departure-times-client.git
```
- Run the project in development mode with npm:
```shell
$ npm start
```
In development mode the service will be available at [localhost:3000](http://localhost:3000)


### To run the project in production mode:
- Pull the code from this repository.
- Build the project: From the root directory of the project run
```shell
$ npm run build
```
- Serve the build folder with a static http server.
```shell
$ npm install -g serve
$ serve -s build
```
If the serve npm module is used to serve the project, then it will be available at [localhost:5000](http://localhost:5000) if the port is available.

## Problems
When building the system, i have run into several issues regarding the documentation of the tfl api.
One of these being that the api offers 3 different ways to get arrival predictions, and the two that was available to me was not consistent with the rest of the data provided by the api.

One of the endpoints delivers a long list of arrays, with each array containing a number, a line name, a station name and a timestamp representing the arrival prediction. The other option delivers arrival prediction for a specific stop id. For the system constructed I settled for using the later endpoint, as there are multiple stops with the same name, so the first option does not give a clear indication of what stop the line will be arriving at.

### Choice of architecture
I have chosen Dropwizard as backend, based on its positive reputation. The same goes for the React frontend, as it provides a good foundation for keeping track of state in a reactive frontend. Initially I wanted the frontend to get the stream of arrival information from tfl directly, but as mentioned this turned out not to be an option. This is why I chose to construct a websocket server, such that the dropwizard REST api is kept state free.

Besides showing some of my capabilities in coding I have seen this project as an opportunity to try out some technologies with which I haven't worked with before. So this has been my first time working with React js, Dropwizard and Websockets.
