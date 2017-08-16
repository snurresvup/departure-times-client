import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {Col, Panel, Row} from "react-bootstrap";

class DepartureTimes extends Component{

  constructor(props){
    super(props);
    this.state = {
      heading: <h3>Select a station to show departure times.</h3>,
      body: new Map()
    };
    //this.handleArrivalPredictionsWSMessage = this.handleArrivalPredictionsWSMessage.bind(this);
  };

  componentDidMount(){
    this.ws = new WebSocket("ws://localhost:8082/websockets/arrivalPredictions");
    this.ws.onmessage = this.handleArrivalPredictionsWSMessage.bind(this);
    this.ws.onopen = () => {
      this.setState({
        webSocketConnected: true
      });
    };
    this.ws.onclose = () => {
      this.setState({
        webSocketConnected: false
      })
    }
  }

  handleArrivalPredictionsWSMessage(message){
    const arrivalData = JSON.parse(message.data);

    this.setState({
      body: arrivalData
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentStop !== prevProps.currentStop) {
      this.updateDepartureTimes();
    }
  }

  updateDepartureTimes(){
    this.ws.send("currentStop:" + this.props.currentStop.name);

    this.setState({
      heading: <h2>Departure times for: {this.props.currentStop.name}</h2>,
      body: new Map()
    });
/*
    fetch(`/arrival-predictions?station=${this.props.currentStop.name}`, {accept: 'application/json'})
        .then(response => {
          return response.json();
        })
        .then(json => {
          console.log(json);
          this.setState({
            heading: <h2>Departure times for: {this.props.currentStop.name}</h2>,
            body: this.buildArrivalTimesList(json)
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            body:<strong>Could not find departure times for: {this.props.currentStop.name}</strong>
          })
        })
        */
  }

  buildLineMapping(arrivalsList){
    const lineMapping = new Map();

    arrivalsList.forEach((arrival) => {
      const current = lineMapping.get(arrival.lineName);
      if(!current || current > arrival.timeToStation){
        lineMapping.set(arrival.lineName, arrival.timeToStation);
      }
    });

    return lineMapping;
  }

  buildArrivalTimesList(data){
    const lineMapping = this.buildLineMapping(data);

    return (
        Array.from(lineMapping.keys()).sort((a,b) => {return a-b}).map((key) => {
          return (
              <Row key={key}>
                <Col xs={1}><p><strong>{key}</strong></p></Col>
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

  renderBody(){
    return (
        Array.from(Object.keys(this.state.body)).sort((a,b) => {return a-b}).map( key => {
          return (
              <Row key={key}>
                <Col xs={1}><p><strong>{key}</strong></p></Col>
                <Col xs={11}><p>Arriving in: {
                  this.state.body[key].arrivalTime < 60 ? "Less than 1 minute." :
                      Math.round(this.state.body[key].arrivalTime/60) +
                      (Math.round(this.state.body[key].arrivalTime/60) > 1 ? " minutes." : " minute.")
                }</p></Col>
              </Row>
          );
        })
    );
  }

  render(){
    return (
        <Panel header={this.state.heading} bsStyle="info">
          {this.renderBody()}
        </Panel>
    );
  }
}

DepartureTimes.propTypes = {
  currentStop: PropTypes.object,
};

DepartureTimes.defaultProps = {
  currentStop: null,
};

export default DepartureTimes;