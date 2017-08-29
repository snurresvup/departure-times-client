import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {Col, Panel, Row} from "react-bootstrap";

class DepartureTimes extends Component{

  constructor(props){
    super(props);
    this.state = {
      heading: <h3>Select a station to show departure times.</h3>,
      body: [],
      isLoading: false
    };
  };

  componentDidMount(){
    this.updateInterval = setInterval(this.getNewArrivalPredictions.bind(this), 5000);
  }

  componentWillUnmount(){
    clearInterval(this.updateInterval);
  }

  getNewArrivalPredictions(){
    if(!this.props.currentStop.id) return;
    fetch(`/arrival-predictions?id=${this.props.currentStop.id}`)
        .then(response => {
          return response.json();
        }).then(json => {
          this.setState({
            body: json,
            isLoading: false
          })
        }).catch(err => {
          console.log(err);
        });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentStop !== prevProps.currentStop) {
      this.updateDepartureTimes();
    }
  }

  //Temporary UI update to inform the user that the app is loading arrival information.
  updateDepartureTimes(){
    this.setState({
      heading: <h2>Departure times for: {this.props.currentStop.name}</h2>,
      body: [],
      isLoading: true
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

  //Converts number to textual arrival estimation
  etaToText(eta){
    if(eta < 60) return "Less than 1 minute.";
    const time = Math.round(eta/60);
    return time + (time > 1 ? " minutes." : " minute.");
  }

  //Responsible for rendering the contents of the DepartureTimes component
  renderBody(){
    if(!this.props.currentStop.id) return;
    if(this.state.isLoading) return (
        <Row>
          <Col xs={12}><strong>Loading...</strong></Col>
        </Row>
    );

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

        const upcomming = ( linemapping.get(key).length > 1 ?
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