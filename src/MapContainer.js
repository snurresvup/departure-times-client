import PropTypes from 'prop-types'
import {GoogleApiWrapper, InfoWindow, Map, Marker} from 'google-maps-react'
import React, {Component} from 'react';

class MapContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedStation: {}
    };
    this.onMarkerClicked = this.onMarkerClicked.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.renderMarkers = this.renderMarkers.bind(this);
  }

  onMarkerClicked(props, marker, event){
    this.props.onStationSelected(props.station, marker);
  }

  onMapClicked(props) {
    this.props.onMapClicked();
  }

  renderMarkers(){
    if(!this.props.stations) return null;
    const {stations, google} = this.props;
    return (
      stations.map((station) => {
        return <Marker key={station.id}
                       name={station.name}
                       id={station.id}
                       position={{lat:station.latitude, lng:station.longitude}}
                       station={station}
                       icon={{
                         url: "bus_stop_icon.png",
                         anchor: new google.maps.Point(10, 10),
                         scaledSize: new google.maps.Size(20, 20)
                       }}
                       onClick={this.onMarkerClicked}/>
      })
    );
  }

  userLocationToPosition() {
    if(!this.props.userLocation || !this.props.userLocation.coords) return;
    const {coords} = this.props.userLocation;
    return {
      lat: coords.latitude,
      lng: coords.longitude
    }
  }

  renderUserLocation(){
    const {google} = this.props;
    return (
      <Marker name="Your location" position={this.userLocationToPosition()} icon={
        {
          url: "user_location.png",
          anchor: new google.maps.Point(14, 14),
          scaledSize: new google.maps.Size(28, 28),
        }
      }
      />
    );
  }

  render() {

    if (!this.props.loaded) {
      return <div>Loading...</div>
    }

    return (
      <div className="embed-responsive embed-responsive-4by3">
        <Map className="embed-responsive-item" initialCenter={{lat:51.507351, lng:-0.127758}} centerAroundCurrentLocation={true} google={this.props.google} zoom={14}>
          {this.renderMarkers()}
          {this.renderUserLocation()}
          <InfoWindow
            position={{lat:this.props.currentStop.latitude, lng: this.props.currentStop.longitude}}
            visible={this.props.infoWindowVisible}>
              <div>
                <p>{this.props.currentStop ? this.props.currentStop.name : "No station selected..."}</p>
              </div>
          </InfoWindow>
        </Map>
      </div>
    )
  }
}

MapContainer.propTypes = {
  stations: PropTypes.array,
  showUserLocation: PropTypes.bool,
  userLocation: PropTypes.object,
  onStationSelected: PropTypes.func,
  onMapClicked: PropTypes.func,
  currentStop: PropTypes.object,
  infoWindowVisible: PropTypes.bool
};

MapContainer.defaultProps = {
  stations: [],
  showUserLocation: false,
  userLocation: {},
  currentStop: {},
  infoWindowVisible: false
};

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDy5fu-Ks91OPhckLKiXvm6YC9faGHaZLg'
})(MapContainer)