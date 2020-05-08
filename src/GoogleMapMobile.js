import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow, Marker, Polygon } from 'google-maps-react';
import { Modal } from 'react-bootstrap';

import { Grid } from '@material-ui/core';
import LocationDetailsMobile from './LocationDetailsMobile';
import LocationSubmitterMobile from './LocationSubmitterMobile';
import * as constants from './constants';
import pulsing from './media/pulsing3.gif';
import wut from './media/wut.gif';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { MyLocation, AddLocation, Favorite, AccountCircle, Photo, Backdrop, ViewComfy } from '@material-ui/icons';

import IconCrosshair from './media/crosshair1.png';

var _ = require('lodash');

export class GoogleMapMobile extends Component {

  state = {
    locations: [],
    centerLat: null,
    centerLong: null,

    currentMapCenterLat: 47.61785407164923,
    currentMapCenterLong: -122.31657144387441,

    show: false,

    modalMode: 'locationDetails', // locationDetails | addLocation

    dragLatitude: constants.DEFAULT_MAP_CENTER.LAT,
    dragLongitude: constants.DEFAULT_MAP_CENTER.LONG
  };

  // const [modalStyle] = React.useState(getModalStyle);
  // const [open, setOpen] = React.useState(false);

  onMarkerClick = (props, marker, e) => {
    // this.setState({
    //   selectedPlace: props,
    //   activeMarker: marker,
    //   showingInfoWindow: true
    // });
    // debugger;

    // this.props.handleMapMarkerClick(props, marker, e);

    this.props.handleMapMarkerClick(props, marker, e);

    this.setState({
      show: true,
      modalMode: 'locationDetails'
    });
  }

  handleClose = () => {
    // debugger;
    this.setState({
      show: false
    });
  };

  mapClicked = (mapProps, map, clickEvent) => {
    // console.log(mapProps);
    // console.log(map);
    console.log(clickEvent);
    // console.log(clickEvent.Za.x, clickEvent.Za.y);
    console.log(clickEvent.latLng.lat(), clickEvent.latLng.lng());

    // this.setState({
    //   pendingLatitude: clickEvent.latLng.lat(),
    //   pendingLongitude: clickEvent.latLng.lng()
    // });

    this.props.handlePendingLatLongChange(clickEvent.latLng.lat(), clickEvent.latLng.lng());
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props.locations, nextProps.locations) || this.props.currentMapCenter.lat === nextProps.currentMapCenter.lat;
    // return nextProps.isFavourite != this.props.isFavourite;
  }

  // this is the Add Location button underneath the map. It is not the Submit Location button.
  handleAddLocationButtonClick = () => {
    this.setState({
      show: true,
      modalMode: 'addLocation'
    });

  }

  centerMoved = (mapProps, map) => {
    // console.log("mapProps, map", mapProps, map);
    // console.log(mapProps.center.lat, mapProps.center.lng);

    console.log(map.getCenter().lat(), map.getCenter().lng());

    this.setState({
      dragLatitude: map.getCenter().lat(),
      dragLongitude: map.getCenter().lng()
    })
  }

  getLocation = () => {
    // var x = document.getElementById("demo");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);

    } else {
      // x.innerHTML = "Geolocation is not supported by this browser.";
      alert("Geolocation is not supported by this browser.");
    }
  }

  showPosition = (position) => {
    // var x = document.getElementById("demo");
    // x.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;

    this.setState({
      dragLatitude: position.coords.latitude,
      dragLongitude: position.coords.longitude
    });
  }


  render() {
    console.log('GoogleMap.js render()');
    let locations = this.props.locations.map((loc) => {

      // const animationStyle = loc.id === this.state.featuredLocationId ? this.props.google.maps.Animation.DROP : false;

      return (
        <Marker
          key={loc.geopoint.latitude + "_" + loc.geopoint.longitude}
          title={loc.nameDescr}
          name={'SOMA'}
          position={{ lat: loc.geopoint.latitude, lng: loc.geopoint.longitude }}
          onClick={this.onMarkerClick}

          locationInfo={loc}

          // animation={false}
          // animation={this.props.google.maps.Animation.DROP}
          animation={false}
        />


      );
    });
    debugger;
    return (
      <div>


        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>LOCATION DETAILS</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            {this.state.modalMode === 'locationDetails' && <LocationDetailsMobile selectedLocation={this.props.selectedLocation} />}

            {this.state.modalMode === 'addLocation' &&
              <LocationSubmitterMobile
                selectedLocation={this.props.selectedLocation}
                latLong={{ latitude: this.state.dragLatitude, longitude: this.state.dragLongitude }}
                db={this.props.db}
                storageRef={this.props.storageRef}
                handleClose={this.handleClose}
              />}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="contained" color="primary" onClick={this.handleClose}>
              Close
          </Button>
            {/* <Button variant="contained" onClick={this.handleClose}>
            Save Changes
          </Button> */}
          </Modal.Footer>
        </Modal>

        {/* container div around GMap to force Add Location button to be below map didn't work */}
        <div>
          {/* <img src={IconCrosshair} style={{posiiton: 'fixed', top: '50%', left: '50%', maxWidth: '20px'}} /> */}
          <Map
            google={this.props.google}
            onDragend={this.centerMoved}
            zoom={13}
            style={
              {
                width: '90%',
                height: this.props.height || '800px'
              }
            }
            initialCenter={{
              lat: constants.DEFAULT_MAP_CENTER.LAT,
              lng: constants.DEFAULT_MAP_CENTER.LONG
            }}
            center={{
              // lat: constants.DEFAULT_MAP_CENTER.LAT,
              // lng: constants.DEFAULT_MAP_CENTER.LONG

              lat: this.state.dragLatitude,
              lng: this.state.dragLongitude
            }}
            onClick={this.mapClicked}
            containerStyle={this.props.containerStyle || null}
          >

            {locations}

            {<Marker
              // name={'Your position'}
              position={{
                lat: this.state.dragLatitude || constants.DEFAULT_MAP_CENTER.LAT,
                lng: this.state.dragLongitude || constants.DEFAULT_MAP_CENTER.LONG
              }}
              icon={{
                // url: 'https://loading.io/icon/i3ca9h',
                // url: pulsing, // works
                url: IconCrosshair, // works
                anchor: new this.props.google.maps.Point(64, 64),
                scaledSize: new this.props.google.maps.Size(128, 128)
              }}
            />}

            {/* <Polygon
            paths={constants.TEST_COORDS}
            strokeColor="#0000FF"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillColor="#0000FF"
            fillOpacity={0.35} /> */}

          </Map>
        </div>



        {/* displays LocationSubmitterMobile in a modal */}
        <div style={{ textAlign: '', position: 'absolute', bottom: '50px', width: '100%' }}>

          <Grid container spacing={3}>

            <Grid item xs={6}>

              <Button variant="contained" color="primary" onClick={this.handleAddLocationButtonClick}>
                <AddLocation /> Add Location
              </Button>
<br/><br/>
              <Button size="small" variant="contained" color="primary" onClick={this.getLocation}>
                <MyLocation /> 
              </Button>
            </Grid>
            <Grid item xs={6}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Position the map so that <br />the center is on the location<br /> you want to add.</span>
            </Grid>

          </Grid>


        </div>


      </div>
    );
  }


}

export default GoogleApiWrapper({
  apiKey: constants.GMAP_API_KEY
})(GoogleMapMobile);