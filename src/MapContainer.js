import PropTypes from 'prop-types'
import {GoogleApiWrapper, InfoWindow, Map, Marker} from 'google-maps-react'
import React, {Component} from 'react';

class MapContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeMarker: {},
      infoWindowVisible: false,
      selectedStation: {}
    };
    this.onMarkerClicked = this.onMarkerClicked.bind(this);
    this.onMapClicked = this.onMapClicked.bind(this);
    this.renderMarkers = this.renderMarkers.bind(this);
  }

  onMarkerClicked(props, marker, event){
    this.setState({
      selectedStation: props,
      activeMarker: marker,
      infoWindowVisible: true
    });
    this.props.onStationSelected(this.state.selectedStation);
  }

  onMapClicked(props) {
    if (this.state.infoWindowVisible) {
      this.setState({
        activeMarker: null,
        infoWindowVisible: false
      });
    }
  }

  renderMarkers(){
    if(!this.props.stations) return null;
    const {stations} = this.props;
    return (
      stations.map((station) => {
        return <Marker key={station.id} name={station.name} id={station.id} position={{lat:station.latitude, lng:station.longitude}} onClick={this.onMarkerClicked}/>
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

    const style = {
    };

    return (
      <div className="embed-responsive embed-responsive-4by3">
        <Map className="embed-responsive-item" initialCenter={{lat:51.507351, lng:-0.127758}} centerAroundCurrentLocation={true} style={style} google={this.props.google} zoom={14}>
          {this.renderMarkers()}
          {this.renderUserLocation()}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.infoWindowVisible}>
              <div>
                <p>{this.state.selectedStation ? this.state.selectedStation.name : "No station selected..."}</p>
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
  onStationSelected: PropTypes.func
};

MapContainer.defaultProps = {
  stations: [],
  showUserLocation: false,
  userLocation: {}
};

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDy5fu-Ks91OPhckLKiXvm6YC9faGHaZLg'
})(MapContainer)