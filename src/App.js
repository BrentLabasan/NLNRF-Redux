import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow, Marker, Polygon } from 'google-maps-react';
import { Navbar, Nav, NavDropdown, Form, FormControl, Container, Row, Col, Dropdown, DropdownButton, ToggleButtonGroup, ToggleButton, Badge } from 'react-bootstrap';
import { Grid, BottomNavigation, BottomNavigationAction, ButtonGroup, Button } from '@material-ui/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import { Map as MapIcon, LocationOn, AddLocation, Favorite, AccountCircle, Photo, Backdrop, ViewComfy } from '@material-ui/icons';
import * as constants from './constants';
import LocationSubmitter from './LocationSubmitter';
import LocationDetails from './LocationDetails';
import LatestSubmissions from './LatestSubmissions';
import PopularSubmissions from './PopularSubmissions';
import MasonryForLocations from './MasonryForLocations';
import SimpleReactLightbox from 'simple-react-lightbox';
import LocationDetailsMobile from './LocationDetailsMobile';
import LatestSubmissionsMobile from './LatestSubmissionsMobile';
import GalleryMobile from './GalleryMobile';

import GoogleMap from './GoogleMap';
import GoogleMapMobile from './GoogleMapMobile';

import CrossUnite from './media/xu.png';
import PoopAndNeedles from './media/poopandneedles.png';

import { Counter } from './features/counter/Counter';
import './App.css';



let db, storage, storageRef;

const hrWidth = '25%';

const apiKey = 'AIzaSyCWIg0OhhYc1_DEXwPOXcBypSNgumuB5t4';

const containerStyle = {
  position: 'relative',
  width: '100%',
  height: '800px',
  // textAlign: 'center',
  // display: 'inline-flex',
  // justifyContent: 'center'
}

const mapStyles = {
  width: '90%',
  height: '800px'
};

export class App extends Component {
  state = {
    showingInfoWindow: false,  //Hides or the shows the infoWindow
    activeMarker: {},          //Shows the active marker upon click
    selectedPlace: {},          //Shows the infoWindow to the selected place upon a marker

    locations: [],

    pendingLocationNameDescription: '',
    pendingLatitude: '',
    pendingLongitude: '',

    pendingPicVid: null,

    usersCurrentLatLong: null,

    currentMapCenterLat: 47.61785407164923,
    currentMapCenterLong: -122.31657144387441,

    selectedLocation: null,

    featuredLocationId: null,

    mobiCurrentSection: 'add',

    areaMenuActive: 'neighborhoods',

    multiActive: 'gallery', // latest, popular, gallery, location

    isPulseVisible: false,

    pulseLat: null,
    pulseLong: null,

    pulseGeopoint: null,

    mobileCurrentView: 'addLocation', // addLocation, latest, gallery

    highlightedSection: null
  };

  handleHover = (area) => {
    // console.log(area);
    this.setState({
      highlightedSection: area
    })
  }

  handleLeave = () => {
    this.setState({
      highlightedSection: null
    })
  }

  setIsPulseVisible = (bool, geopoint) => {
    // debugger;
    this.setState({
      isPulseVisible: bool,
      pulseGeopoint: geopoint
    })
  }

  // setPulseLagLong = (geopoint) => {
  //   debugger;
  //   this.setState({
  //     pulseGeopoint: geopoint
  //   })
  // }


  handleAreaMenuChange = (selection) => {
    this.setState({
      areaMenuActive: selection
    });
  }

  handleMultiChange = (selection) => {
    this.setState({
      multiActive: selection
    });
  }

  handlePendingLatLongChange = (lat, long) => {

    this.setState({
      pendingLatitude: lat,
      pendingLongitude: long
    });
  }

  handlePendingLocationNameDescription = (locationNameDescription) => {
    this.setState({
      pendingLocationNameDescription: locationNameDescription
    });
  }

  handleMobiCurrSectionChange = (event, value) => {
    this.setState({ mobileCurrentView: value })
  }

  handleMapMarkerClick = (props, marker, e) => {

    // console.log(props);
    // console.log(marker);
    // console.log(e);

    console.log(props.locationInfo);

    this.setState({
      selectedLocation: props.locationInfo,
      multiActive: 'location'
    });
  }

  componentDidMount() {
    let targetX = document.getElementById("demo");

    // Initialize Firebase
    firebase.initializeApp(constants.FIREBASE_CONFIG);
    firebase.analytics();

    db = firebase.firestore();

    // Get a reference to the storage service, which is used to create references in your storage bucket
    storage = firebase.storage();
    storageRef = storage.ref();

    db.collection("locations")
      // .where("state", "==", "CA")
      .onSnapshot((querySnapshot) => {
        var locations = [];
        querySnapshot.forEach(function (loc) {
          // locations.push(loc.data().geopoint.latitude);
          locations.push(loc.data());
        });
        console.log("Current cities in CA: ", locations.join(", "));
        this.setState({
          locations: locations
        });
      });

  }

  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  getLocation = () => {
    var x = document.getElementById("demo");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);



    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  showPosition = (position) => {
    var x = document.getElementById("demo");

    x.innerHTML = "Latitude: " + position.coords.latitude +
      "<br>Longitude: " + position.coords.longitude;
    this.setState({
      currentMapCenterLat: position.coords.latitude,
      currentMapCenterLong: position.coords.longitude
    });
  }


  handleSubmit = (e) => {
    e.preventDefault();

    // Add a new document with a generated id.
    db.collection("locations").add({
      nameDescr: this.state.pendingLocationNameDescription,
      geopoint: new firebase.firestore.GeoPoint(this.state.pendingLatitude, this.state.pendingLongitude),
      dateTime: moment().format(),
      mediaUrl: null
    })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);

        this.setState({
          pendingLocationNameDescription: '',
          pendingLatitude: '',
          pendingLongitude: ''
        });

        if (document.getElementById('fileSelector').files[0]) {
          let file = document.getElementById('fileSelector').files[0];

          const guid = uuidv4();
          var pendingMediaRef = storageRef.child('locations/' + guid);

          pendingMediaRef.put(file).then((snapshot) => {
            console.log(`Media uploaded successfully :) GUID: ${guid}`);
            console.log(snapshot);

            document.getElementById('fileSelector').value = null;

            storageRef.child('locations/' + guid).getDownloadURL().then((url) => {
              // `url` is the download URL for 'images/stars.jpg'

              /*
              // This can be downloaded directly:
              var xhr = new XMLHttpRequest();
              xhr.responseType = 'blob';
              xhr.onload = function(event) {
                var blob = xhr.response;
              };
              xhr.open('GET', url);
              xhr.send();
              */

              // Or inserted into an <img> element:
              // var img = document.getElementById('myimg');
              // img.src = url;



              var tempRef = db.collection("locations").doc(docRef.id);

              // Set the "capital" field of the city 'DC'
              return tempRef.update({
                id: docRef.id,
                mediaUrl: url
              })
                .then(() => {
                  console.log("Document successfully updated with the media URL :)");
                })
                .catch((error) => {
                  // The document probably doesn't exist.
                  console.error("Error updating document: ", error);
                });


            }).catch((error) => {
              // Handle any errors
            });


          });
        }


      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });

  }

  clickLatestSubmissionLi = (loc) => {
    // debugger;
    this.setState({
      multiActive: 'location',
      isPulseVisible: false,
      selectedLocation: loc
    });
  }


  multiGenerator = () => {
    // debugger;
    switch (this.state.multiActive) {
      case 'latest':
        return <LatestSubmissions clickLatestSubmissionLi={this.clickLatestSubmissionLi} setPulseLangLong={this.setPulseLangLong} setIsPulseVisible={this.setIsPulseVisible} locations={this.state.locations} />
        break;
      case 'popular':
        return <PopularSubmissions locations={this.state.locations} />
        break;
      case 'gallery':
        return <MasonryForLocations clickLatestSubmissionLi={this.clickLatestSubmissionLi} setPulseLangLong={this.setPulseLangLong} setIsPulseVisible={this.setIsPulseVisible} locations={this.state.locations} />
        break;
      case 'location':
        if (this.state.selectedLocation) {
          return <LocationDetails selectedLocation={this.state.selectedLocation} />
        } else {
          return <div style={{ display: 'inline-flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}><h3><LocationOn style={{ fontSize: 80 }} />Click on a marker to show its details.</h3></div>;
        }
        return
        break;
      // default:
      // code block
    }

    // if (!this.state.selectedLocation) {
    //   return <div style={{ display: 'inline-flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}><h3><LocationOn style={{ fontSize: 80 }} />Click on a marker to show its details.</h3></div>;
    // }
  }

  setPulseVisibility = () => {

  }



  render() {
    // console.log("App.js render()");

    return (
      <div className="App">
        <SimpleReactLightbox>

          <BrowserView>
            <header>
              <h1 id="heroLogo">
                NLNRF<span style={{ fontSize: '18px', marginLeft: '-15px' }} >.com</span>
                &nbsp; {this.props.count}
          <span className='slogan'>NOT LEFT. NOT RIGHT. FORWARD &gt;</span>
              </h1>
            </header>




            <br />

            {/* <hr class="style3" style={{width: hrWidth }} ></hr> */}


            <Row>

              {/* <ButtonGroup variant="contained" aria-label="contained primary button group" disableElevation>
            <Button onClick={() => { this.handleAreaMenuChange('landmarks') }} color={this.state.areaMenuActive === 'landmarks' ? 'primary' : 'default'} disableElevation>LANDMARKS</Button>
            <Button onClick={() => { this.handleAreaMenuChange('neighborhoods') }} color={this.state.areaMenuActive === 'neighborhoods' ? 'primary' : 'default'} disableElevation>NEIGHBORHOODS</Button>
          </ButtonGroup> */}

              {/* 
          {this.state.areaMenuActive === 'landmarks' && <Col>
            <Navbar expand="lg" bg="" variant="">

              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">

                <Nav className="mr-auto">

                  <NavDropdown title="Amazon SLU Campus" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Seattle Center / Space Needle" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Pike Place" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="University of Washington" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>


                  <NavDropdown title="Seattle University" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Community Colleges" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                </Nav>
              </Navbar.Collapse>

              <Navbar.Collapse id="basic-navbar-nav"></Navbar.Collapse>

            </Navbar>
          </Col>}
 */}

              
          {this.state.areaMenuActive === 'neighborhoods' && <Col>
            <Navbar expand="lg" bg="" variant="">

              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">

                <Nav className="mr-auto">

                  <NavDropdown title="Downtown" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="Capitol Hill" id="basic-nav-dropdown" onMouseEnter={ () => {this.handleHover('capitolHill')} } onMouseLeave={ this.handleLeave }>
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown title="First Hill" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>


                  <NavDropdown title="Pioneer Square" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>


                  <NavDropdown title="West Seattle" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>


                  <NavDropdown title="Chinatown" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>


                  <NavDropdown title="Fremont" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>

                </Nav>

              </Navbar.Collapse>

              <Navbar.Collapse id="basic-navbar-nav"></Navbar.Collapse>

            </Navbar>
          </Col>
          }


            </Row>


            <Grid container spacing={3}>

              <Grid item xs={6}>
                <div style={containerStyle}>

                  {/* TODO */}

                  {/* <Map
  google={this.props.google}
  zoom={13}
  style={mapStyles}
  initialCenter={{
    lat: this.state.currentMapCenterLat,
    lng: this.state.currentMapCenterLong
  }}
  center={{
    lat: this.state.currentMapCenterLat,
    lng: this.state.currentMapCenterLong
  }}
  onClick={this.mapClicked}
>

  {locations}

</Map> */}

                  <GoogleMap
                    locations={this.state.locations}
                    handlePendingLatLongChange={this.handlePendingLatLongChange}
                    handleMapMarkerClick={this.handleMapMarkerClick}
                    currentMapCenter={{ lat: this.state.currentMapCenterLat, long: this.state.currentMapCenterLong }}
                    isPulseVisible={this.state.isPulseVisible}
                    pulseGeopoint={this.state.pulseGeopoint}
                    areaHover={this.state.highlightedSection}
                  />

                </div>

              </Grid>
              <Grid item xs={6}>
                {/* <ToggleButtonGroup type="radio" name="options" defaultValue={1}>
              <ToggleButton value={1}>LATEST</ToggleButton>
              <ToggleButton value={2}>MOST UPVOTED</ToggleButton>
            </ToggleButtonGroup> */}

                <br /><br />

                <div style={{ textAlign: 'center' }}>
                  <ButtonGroup variant="contained" aria-label="contained primary button group" disableElevation>
                    <Button onClick={() => { this.handleMultiChange('location') }} color={this.state.multiActive === 'location' ? 'primary' : 'default'} disableElevation><LocationOn style={{ fontSize: null }} /></Button>
                    <Button onClick={() => { this.handleMultiChange('latest') }} color={this.state.multiActive === 'latest' ? 'primary' : 'default'} disableElevation>LATEST</Button>
                    <Button onClick={() => { this.handleMultiChange('popular') }} color={this.state.multiActive === 'popular' ? 'primary' : 'default'} disableElevation>POPULAR</Button>
                    <Button onClick={() => { this.handleMultiChange('gallery') }} color={this.state.multiActive === 'gallery' ? 'primary' : 'default'} disableElevation>GALLERY</Button>
                  </ButtonGroup>
                </div>

                <br /><br />

                {/* {!this.state.selectedLocation && <div style={{ display: 'inline-flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}><h3><LocationOn style={{ fontSize: 80 }} />Click on a marker to show its details.</h3></div>} */}
                {this.multiGenerator()}

                {/* {this.state.selectedLocation && this.state.multiActive === 'location' && <LocationDetails selectedLocation={this.state.selectedLocation} />}
            {this.state.multiActive === 'latest' && <LatestSubmissions locations={this.state.locations} />}
            {this.state.multiActive === 'popular' && <PopularSubmissions locations={this.state.locations} />}
            {this.state.multiActive === 'gallery' && <Masonry locations={this.state.locations} />} */}

              </Grid>

            </Grid>


            <br /> <br />

            <section className="add-item">


              {/* <Form onSubmit={this.handleSubmit} inline={false}> */}

              {/*
          <Form inline={false}>
            <Container fluid={true}>

              <Row>
                <Col xs="auto">
                  STEP<br />
                  1
              </Col>
                <Col xs={2}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>LATITUDE / LONGITUDE</Form.Label>
                    <Form.Control type="text" name="pendingLatitude" placeholder="latitude" onChange={this.handleChange} value={this.state.pendingLatitude + ', ' + this.state.pendingLongitude} />
                    <Form.Text className="text-muted">
                      Click on the map to automatically fill in the lat/long coordinates.
    </Form.Text>
                  </Form.Group>
                </Col>
                <Col xs="auto">
                  STEP<br />
                  2
              </Col>
                <Col xs={2}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>VISUAL TYPE</Form.Label>
                    <DropdownButton id="dropdown-basic-button" title="Visual Type" variant="primary">
                      <Dropdown.Item href="#/action-1">business card</Dropdown.Item>
                      <Dropdown.Item href="#/action-1">chalk</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">sharpie</Dropdown.Item>
                      <Dropdown.Item href="#/action-3">paint / permanent marker</Dropdown.Item>
                      <Dropdown.Item href="#/action-3">sticker</Dropdown.Item>
                      <Dropdown.Item href="#/action-3">poster</Dropdown.Item>
                      <Dropdown.Item href="#/action-3">mural</Dropdown.Item>
                      <Dropdown.Item href="#/action-3">other</Dropdown.Item>
                    </DropdownButton>
                    <Form.Text className="text-muted">
                      Select which category best describes your medium.
    </Form.Text>
                  </Form.Group>
                </Col>
                <Col xs="auto">
                  STEP<br />
                  3
              </Col>

                <Col xs={2}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>LOCATION NAME / DESCRIPTION</Form.Label>
                    <Form.Control type="text" name="pendingLocationNameDescription" placeholder="location name / description" onChange={this.handleChange} value={this.state.pendingLocationNameDescription} />
                    <Form.Text className="text-muted">
                      example: Space Needle, Pike Place Market, Fremont Troll
    </Form.Text>
                  </Form.Group>
                </Col>

                <Col xs="auto">
                  STEP<br />
                  4
              </Col>
                <Col xs={1}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>PIC / VIDEO</Form.Label>

                    <input type="file" id="fileSelector"></input>

                  </Form.Group>
                </Col>

                <Col xs="auto">
                  STEP<br />
                  5
              </Col>
                <Col xs={1}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>&nbsp;</Form.Label>
                    <br />


                    <Button onClick={this.handleSubmit} variant="success" size="lg">SUBMIT LOCATION</Button>
                  </Form.Group>
                </Col>


              </Row>
            </Container>

          </Form>
        */}
              <h2><LocationOn style={{ fontSize: 80 }} />ADD LOCATION</h2>
              <LocationSubmitter
                db={db}
                storageRef={storageRef}
                pendingLatitude={this.state.pendingLatitude}
                pendingLongitude={this.state.pendingLongitude}
                pendingLocationNameDescription={this.state.pendingLocationNameDescription}

                handlePendingLatLongChange={this.handlePendingLatLongChange}
                handlePendingLocationNameDescription={this.handlePendingLocationNameDescription}
              />

            </section>

            <br /> <br />

            {/* <p>🗺️ CENTER MAP TO YOUR LOCATION</p> */}

            <button onClick={this.getLocation}>🗺️ CENTER MAP TO YOUR LOCATION</button>

            <p id="demo"></p>

            <br /> <br />

            <hr className="style3" style={{ width: hrWidth }} ></hr>

            <br /> <br />

            <footer>
              <Row>
                <Col xs={4}>
                  <h3>What is NLNRF?</h3>
                  <p>NLNRF is an acronym for "Not left. Not right. Forward." It's a great slogan for uniting people to tackle the problems Andrew Yang is focused on solving world problems such as mass job displace due to automation, the ever-widening income inequality gap, and climate change.</p>
                </Col>
                <Col xs={4}>
                  <h3>How can I help spread the NLNRF message?</h3>
                  <p>
                    <ol>
                      <li>Chalk, sticker, sharpie, graffiti the slogan "Not left. Not right. Forward." on surfaces where as much people will see! Use the map above to figure out where high trafficed or underrepresented locations are.</li>
                      <li>And then post your work to this site!</li>
                      <li>Reach out to new people and encourage them to spread the NLNRF message!</li>
                      <li>If you're a programmer/developer, check out the To-Do List below, communicate an choose a task to work on, pair program with Brent if necessary, and then submit a pull request. <a href="https://github.com/BrentLabasan/NLNRF" target="_blank">GitHub</a></li>
                    </ol>
                  </p>
                </Col>
                <Col xs={4}>
                  <h3>Tell me more about Andrew Yang.</h3>
                  <p>Andrew Yang is a former Democratic presidential candidate (2020) and CNN political commentator,  focused on solving world problems such as mass job displace due to automation, the ever-widening income inequality gap, and climate change.</p>
                </Col>
              </Row>

              <Row>
                <Col>
                  <h4>To-Do List</h4>
                </Col>
              </Row>

              <Row>
                <Col xs={3}>
                  <h5>Functional</h5>
                  <ul>
                    <li>create mobile-friendly layout <Badge variant="light">NOT STARTED</Badge> <Badge variant="danger">HIGHEST PRIORITY</Badge> </li>
                    <li>submit imgur, YouTube, Instagram media</li>
                    {/* <li></li> */}
                  </ul>
                </Col>

                <Col xs={3}>
                  <h5>Social</h5>
                  <ul>
                    <li>implement user account system <Badge variant="light">NOT STARTED</Badge></li>
                    <li>users can favorite their favorite NLNRF locations <Badge variant="light">NOT STARTED</Badge></li>
                    <li>users can upvote an NLNRF location <Badge variant="light">NOT STARTED</Badge></li>
                  </ul>
                </Col>

                <Col xs={3}>
                  <h5>Cosmetic</h5>
                  <ul>
                    <li>Is the blue color scheme good? <Badge variant="light">NOT STARTED</Badge></li>
                    {/* <li></li>
                <li></li> */}
                  </ul>
                </Col>

                <Col xs={3}>
                  <h5>Underneath The Hood</h5>
                  <ul>
                    <li>The app is one big component. Separate the components into separate, especially because even simple actions like clicking on the map or typing one letter for the location description causes map and NLNRF locations to re-render. <Badge variant="light">NOT STARTED</Badge></li>
                    {/* <li></li>
                <li></li> */}
                  </ul>
                </Col>

              </Row>

              <section id="byline">
                <h6>
                  NLNRF was designed and developed by <a href="BrentVLabasan.com" target="_blank">Brent Labasan X&gt;</a>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              If you would like to help Brent work on NLNRF.com, contact him at BrentLabasan@gmail.com or @BrentLabasan <a href="https://github.com/BrentLabasan/NLNRF" target="_blank">GitHub</a>
                </h6>
              </section>

              <br /><br />

              <section id="logos">
                <img src={CrossUnite} className="" alt="" style={{ maxHeight: '50px' }} />

                <a href="https://FabricatorMusic.com" className="FabricatorMusic" target="_blank">
                  <span className="FabricatorMusic">Fabricator Music</span>
                </a>

                <img src={PoopAndNeedles} className="" alt="" style={{ maxHeight: '50px' }} />


              </section>

            </footer>!
          </BrowserView>

          <MobileView>

            <header>
              <h1 id="heroLogo" style={{ fontSize: '20px' }}>

                NLNRF<span style={{ fontSize: '15px', marginLeft: '0px' }} >.com</span>

                &nbsp;
          <span className='slogan' style={{ fontSize: '10px', fontWeight: 'bold' }}>NOT LEFT. NOT RIGHT. FORWARD &gt;</span>
              </h1>
            </header>

            {this.state.mobileCurrentView === 'addLocation' && <div style={{ height: '400px' }}>
              <GoogleMapMobile
                locations={this.state.locations}
                handlePendingLatLongChange={this.handlePendingLatLongChange}
                handleMapMarkerClick={this.handleMapMarkerClick}
                currentMapCenter={{ lat: this.state.currentMapCenterLat, long: this.state.currentMapCenterLong }}
                isPulseVisible={this.state.isPulseVisible}
                pulseGeopoint={this.state.pulseGeopoint}
                height={'75%'}

                containerStyle={{ height: '75%' }}

                selectedLocation={this.state.selectedLocation}

                db={db}
                storageRef={storageRef}
              />

              {/* <LocationDetailsMobile selectedLocation={this.state.selectedLocation} /> */}
            </div>}

            {this.state.mobileCurrentView === 'latest' && <LatestSubmissionsMobile
              clickLatestSubmissionLi={this.clickLatestSubmissionLi} setPulseLangLong={this.setPulseLangLong} setIsPulseVisible={this.setIsPulseVisible} locations={this.state.locations}
            />}

            {this.state.mobileCurrentView === 'gallery' && <GalleryMobile
              clickLatestSubmissionLi={this.clickLatestSubmissionLi} setPulseLangLong={this.setPulseLangLong} setIsPulseVisible={this.setIsPulseVisible} locations={this.state.locations}
            />}

            {/* <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}> */}
            <div>
              {/* <Grid container spacing={3}>
                <Grid item xs={12}> */}
              <BottomNavigation value={this.state.mobiCurrentSection} onChange={this.handleMobiCurrSectionChange} className={null} style={{ position: 'fixed', bottom: this.state.mobileCurrentView === 'addLocation' ? '75px' : 0, left: 0, width: '100%' }}>
                <BottomNavigationAction label="Add Location" value="addLocation" icon={<MapIcon />} />
                <BottomNavigationAction label="Latest" value="latest" icon={<Photo />} />
                <BottomNavigationAction label="Gallery" value="gallery" icon={<ViewComfy />} />

                {/* <BottomNavigationAction label="Favorites" value="favorites" icon={<Favorite />} /> */}
                {/* <BottomNavigationAction label="Account" value="account" icon={<AccountCircle />} /> */}
              </BottomNavigation>
              {/* </Grid>
              </Grid> */}
            </div>


          </MobileView>

        </SimpleReactLightbox>
      </div >


    );
  }
}

export default GoogleApiWrapper({
  apiKey: constants.GMAP_API_KEY
})(App);