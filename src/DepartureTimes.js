import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {Col, Panel, Row} from "react-bootstrap";

class DepartureTimes extends Component{

  constructor(props){
    super(props);
    this.state = {
      heading: <h3>Select a station to show departure times.</h3>,
      body: []
    };
  };

  componentDidMount(){
    this.ws = new WebSocket("ws://localhost:8082/websockets/arrivalPredictionsById");
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

    console.log(arrivalData);

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
    this.ws.send("currentStopId:" + this.props.currentStop.id);

    this.setState({
      heading: <h2>Departure times for: {this.props.currentStop.name}</h2>,
      body: []
    });
  }

  buildLineMapping(arrivalsList){
    const lineMapping = new Map();

    arrivalsList.forEach((arrival) => {
      const current = lineMapping.get(arrival.lineName);
      if(!current){
        lineMapping.set(arrival.lineName, [arrival]);
      } else {
        current.push(arrival)
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

  etaToText(eta){
    if(eta < 60) return "Less than 1 minute.";
    const time = Math.round(eta/60);
    return time + (time > 1 ? " minutes." : " minute.");
  }

  renderBody(){
    if(!this.props.currentStop.id) return;

    const linemapping = this.buildLineMapping(
        this.state.body.sort((a, b) => {
          if (a.lineName !== b.lineName) {
            return a.lineName - b.lineName;
          }
          return a.timeToStation - b.timeToStation;
        })
    );

    if(linemapping.size === 0) return <p><strong>No data available for the selected stop</strong></p>;

    const heading = (
        <Row key="header">
          <Col xs={1}><strong>Line</strong></Col>
          <Col xs={3}><strong>Next</strong></Col>
          <Col xs={3}><strong>Upcomming</strong></Col>
        </Row>
    );

    const body = (
      Array.from(linemapping.keys()).map(key => {
        const next = (<Col xs={3}><p>Arriving in: {
          this.etaToText(linemapping.get(key)[0].timeToStation)
        }</p></Col>);

        const upcomming = ( linemapping.get(key).size > 1 ?
            <Col xs={3}><p>Arriving in: {
              this.etaToText(linemapping.get(key)[1].timeToStation)
            }</p></Col> : [] );

        return (
            <Row key={key.id}>
              <Col xs={1}><p><strong>{key}</strong></p></Col>
              {next}
              {upcomming}
            </Row>
        );
      })
    );

    return [heading, body];
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