import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import {Col, Form, FormGroup, PageHeader, Row} from 'react-bootstrap';
import './App.css';
import MapContainer from './MapContainer';
import DepartureTimes from './DepartureTimes';
import {Typeahead} from "react-bootstrap-typeahead";


class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      modes: [],
      currentStop: {},
      selectedMode: "",
      markedStations: [],
      knownStations: [],
      userLocation: {},
      departureTimesHeading: <h1>Departure Times</h1>,
      departureTimes: ""
    };
  }

  componentDidMount(){
    //this.updateTransportationModes();
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        userLocation: position
      });
    });
    navigator.geolocation.watchPosition((position) => {
      this.setState({
        userLocation: position
      });
    });
    this.getAvailableStops();
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.userLocation !== prevState.userLocation){
      this.updateMarkedStations()
    }
  }

  //Gets all of the stations within a 2km radius of the users location
  updateMarkedStations(){
    fetch(`/stations?lat=${this.state.userLocation.coords.latitude}&lng=${this.state.userLocation.coords.longitude}&radius=2000`)
        .then(response => {
          return response.json()
        }).then(json => {
          this.setState({
            markedStations: json
          });
        }).catch(err => {
          console.error(err);
        });
  }

  //Handler called when the MapContainer selects a new station
  handleStopChangedByMap(stop){
    this.setState({
      currentStop: stop,
      infoWindowVisible: true
    });
  }

  //Handler called when typeahead selects a station
  handleStopChanged(stop){
    if(!stop[0]) return;

    if(!this.stopIsMarked(stop[0])) {
      //Add the station to the map
      this.setState({
        markedStations: this.state.markedStations.concat(stop[0])
      });
    }

    this.handleStopChangedByMap(stop[0]);
  }

  //Closes the info window on the google map
  handleMapClicked(){
    this.setState({
      infoWindowVisible: false
    });
  }

  //Checks if the given stop is marked on the google map
  stopIsMarked(stop){
    for(let st of this.state.markedStations){
      if(st.id === stop.id) return true;
    }
    return false;
  }

  //Gets the list of all known bus stops from the API
  getAvailableStops(){
    fetch('/stations').then( response => {
      return response.json();
    }).then( json => {
      this.setState({
        knownStations: json.sort((a, b) => {
          if(a.name < b.name) {
            return -1;
          } else if(a.name > b.name) {
            return 1;
          } else {
            return 0;
          }
        })
      });
    }).catch( err => {
      console.error(err);
    });
  }

  //Responsible for rendering each individual item in the typeahead menu
  renderTypeaheadItem(result, props){
    const stop = <strong key={result.id}>{result.name}</strong>;
    const distance = Math.round(this.distance(this.state.userLocation.coords, {latitude: result.latitude, longitude: result.longitude}));
    const unit = distance > 1000 ? "km." : "m.";

    const distanceField = <p key={result.id + "dist"}>Distance: {distance > 1000 ? distance / 1000 : distance} {unit}</p>;
    return [stop, distanceField];
  }

  /**
   * Uses the 'haversine' formula to calculate the great-circle distance between location1 and location2 in meters.
   * Source: http://www.movable-type.co.uk/scripts/latlong.html
   * @param location1
   * @param location2
   * @return the distnace between the two points in meters.
   */
  distance(location1, location2) {
    const earthRadius = 6371;
    const latxRadians = this.toRadians(location1.latitude);
    const latyRadians = this.toRadians(location2.latitude);
    const deltaLatRadians = this.toRadians(location1.latitude - location2.latitude);
    const deltaLngRadians = this.toRadians(location1.longitude - location2.longitude);

    const a = Math.pow(Math.sin(deltaLatRadians/2), 2)
        + Math.cos(latxRadians) * Math.cos(latyRadians) * Math.pow(Math.sin(deltaLngRadians/2), 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return earthRadius * c * 1000;
  }

  toRadians(degrees){
    return degrees * (Math.PI/180);
  }

  render() {
    return (
      <div>
        <PageHeader className="centering">Departure Times For London Buses</PageHeader>
        <div className="container">

          <Form horizontal>
            <Row>
              <Col xs={12} sm={12}>
                <FormGroup>
                  <Col sm={12}>
                    <Typeahead
                        placeholder="Select busstop to show departure times."
                        labelKey="name"
                        onChange={this.handleStopChanged.bind(this)}
                        options={this.state.knownStations}
                        renderMenuItemChildren={this.renderTypeaheadItem.bind(this)}
                        emptyLabel="No stops found"
                    />

                  </Col>
                </FormGroup>
              </Col>
            </Row>
          </Form>

          <Row>
            <Col sm={12}>
              <DepartureTimes currentStop={this.state.currentStop}/>
            </Col>
          </Row>

          <Row>
            <Col sm={12}>
              <MapContainer onStationSelected={this.handleStopChangedByMap.bind(this)}
                            onMapClicked={this.handleMapClicked}
                            currentStop={this.state.currentStop}
                            infoWindowVisible={this.state.infoWindowVisible}
                            userLocation={this.state.userLocation}
                            showUserLocation={true}
                            stations={this.state.markedStations}/>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default App;
