import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import {Col, Form, FormGroup, PageHeader, Row, Panel} from 'react-bootstrap';
import './App.css';
import MapContainer from "./MapContainer";
import axios from 'axios'
import {Typeahead} from "react-bootstrap-typeahead";


class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      modes: [],
      selectedMode: "",
      stations: [],
      userLocation: {},
      departureTimesHeading: <h1>Departure Times</h1>,
      departureTimes: ""
    };

    this.handleModeChanged = this.handleModeChanged.bind(this);
    this.getArrivalPredictions = this.getArrivalPredictions.bind(this);
    this.onStationSelected = this.onStationSelected.bind(this);
    this.handleStopChanged = this.handleStopChanged.bind(this);
  }

  componentDidMount(){
    this.updateTransportationModes();
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        userLocation: position
      });
      this.updateStations();
    });
    navigator.geolocation.watchPosition((position) => {
      this.setState({
        userLocation: position
      });
    });
  }


  updateStations(){
    axios.get('http://localhost:8080/stations', {params: {lat: this.state.userLocation.coords.latitude ,lng: this.state.userLocation.coords.longitude, radius: 200}})
        .then((response) => {
          console.log(response);
          this.setState({
            stations: response.data
          });
        })
        .catch((err) => {
          console.error(err);
        });
  }

  updateTransportationModes() {
    axios.get('http://localhost:8080/mode')
        .then((response) => {
          this.setState({
            modes: response.data
          });
        })
        .catch((err) => {
          console.error(err);
        });
  }

  getTransportationModes() {
    return (
        this.state.modes.map((mode) => {
          return <option key={mode} value={mode}>{mode}</option>
        })
    );
  }

  getArrivalPredictions(e){
    e.preventDefault();

    axios.get('http://localhost:8080/arrival-predictions', {params: {mode: this.state.selectedMode}})
        .then((response) => {
          console.log('response');
        }).catch((err) => {
          console.error(err);
        });

  }

  handleModeChanged(e){
    this.setState({
      selectedMode: e.target.value
    })
  }

  buildArrivalTimesList(list){
    const lineMapping = new Map();

    list.forEach((arrival) => {
      const current = lineMapping.get(arrival.lineName);
      if(!current || current > arrival.timeToStation){
        lineMapping.set(arrival.lineName, arrival.timeToStation);
      }
    });

    return (
          Array.from(lineMapping.keys()).sort((a,b)=>{return a-b}).map((key) => {
            return (
              <Row key={key}>
                <Col xs={1}><p key={key}><strong>{key}</strong></p></Col>
                <Col xs={11}><p>Arriving in: {
                  lineMapping.get(key) < 60 ? "Less than 1 minute." :
                      Math.round(lineMapping.get(key)/60) +
                      (Math.round(lineMapping.get(key)/60) > 1 ? " minutes." : " minute.")
                }</p></Col>
              </Row>
            );
          })
    );
  }

  onStationSelected(station){

    this.setState({
      departureTimesHeading: <h2>Departure times for: {station.name}</h2>,
      departureTimes: <strong>Loading...</strong>
    });
    console.log(station);

    axios.get('http://localhost:8080/arrival-predictions', {params: { /*id : station.id,*/ station : station.name }})
        .then((response) => {
          this.setState({
            departureTimesHeading: <h2>Departure times for: {station.name}</h2>,
            departureTimes: this.buildArrivalTimesList(response.data)
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            departureTimes: <h1>Could not find departure times for: {station.name}</h1>
          })
        });
  }

  handleStopChanged(stop){
    if(!stop[0]) return;
    this.onStationSelected(stop[0]);
  }

  getAvailableStops(){
    return this.state.stations;
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
                        onChange={this.handleStopChanged}
                        options={this.getAvailableStops()}/>

                  </Col>
                </FormGroup>
              </Col>
            </Row>
          </Form>

          <Row>
            <Col sm={12}>
              <Panel header={this.state.departureTimesHeading} bsStyle="info">
                {this.state.departureTimes}
              </Panel>
            </Col>
          </Row>

          <Row>
            <Col sm={12}>
              <MapContainer onStationSelected={this.onStationSelected} userLocation={this.state.userLocation} showUserLocation={true} stations={this.state.stations}/>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default App;
