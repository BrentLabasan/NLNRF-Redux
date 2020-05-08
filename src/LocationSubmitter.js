import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Container, Row, Col, Dropdown, DropdownButton, ToggleButtonGroup, ToggleButton, Badge } from 'react-bootstrap';
import { Backdrop, Button as ButtonM } from '@material-ui/core';
import { LocationOn, AddLocation, Favorite, AccountCircle, Photo  } from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as firebase from 'firebase';
import 'firebase/firestore';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import useInput from './hookUseInput';


export default function LocationSubmitter(props) {
  const { value: locationNameDescription, bind: bindLocationNameDescription, reset: resetlocationNameDescription } = useInput('');


  const [open, setOpen] = useState(false);

  const [location, setLocation] = useState({
    latitude: 'a',
    longitude: 'b'
  });

  const [locationName, setLocationName] = useState({
    latitude: 'a',
    longitude: 'b'
  });

  const [pendingLatLong, setPendingLatLong] = useState('a');

  function NameForm(props) {
    const { value, bind, reset } = useInput('');

    const handleSubmit = (evt) => {
      evt.preventDefault();
      alert(`Submitting Name ${value}`);
      reset();
    }
    return (
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" {...bind} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }

  function handleSubmit(e) {
    setOpen(true);
    e.preventDefault();
    debugger;
    // Add a new document with a generated id.
    props.db.collection("locations").add({
      nameDescr: props.pendingLocationNameDescription,
      geopoint: new firebase.firestore.GeoPoint(props.pendingLatitude, props.pendingLongitude),
      dateTime: moment().format(),
      mediaUrl: null
    })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);

        // this.setState({
        //   pendingLocationNameDescription: '',
        //   pendingLatitude: '',
        //   pendingLongitude: ''
        // });

        props.handlePendingLatLongChange('', '');
        props.handlePendingLocationNameDescription('');


        if (document.getElementById('fileSelector').files[0]) {
          let file = document.getElementById('fileSelector').files[0];

          const guid = uuidv4();
          var pendingMediaRef = props.storageRef.child('locations/' + guid);

          pendingMediaRef.put(file).then((snapshot) => {
            console.log(`Media uploaded successfully :) GUID: ${guid}`);
            console.log(snapshot);

            document.getElementById('fileSelector').value = null;

            props.storageRef.child('locations/' + guid).getDownloadURL().then((url) => {
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



              var tempRef = props.db.collection("locations").doc(docRef.id);

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

        setOpen(false);
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });

  }

  function changePendingLocationNameDescription(e) {
    e.preventDefault();

    props.handlePendingLocationNameDescription(e.target.value);
  }

  function inputLatLongVal() {
    return props.pendingLatitude ? (props.pendingLatitude + ', ' + props.pendingLongitude) : '*';
  }

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
  }));

  const classes = useStyles();

  const handleClose = () => {
    // setOpen(isSubmitting);
  };

  return (

    <Form inline={false}>
      <Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Container fluid={true}>

        <Row>
          <Col xs="auto">

            <span>
              STEP<br />
              1
</span>


          </Col>
          <Col xs={2}>
            <Form.Group controlId="formBasicEmail">

              <Form.Label>LATITUDE / LONGITUDE</Form.Label> <Badge variant="danger">REQUIRED</Badge>

              <Form.Control type="text" name="pendingLatitude" placeholder="latitude" value={inputLatLongVal()} />
              <Form.Text className="text-muted">
                Click on the map to automatically fill in the lat/long coordinates.
</Form.Text>
            </Form.Group>
          </Col>
          {/* 
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
          </Col> */}

          <Col xs="auto">
            STEP<br />
            2
      </Col>

          <Col xs={2}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>LOCATION NAME / DESCRIPTION</Form.Label> <Badge variant="danger">REQUIRED</Badge>
              <Form.Control type="text" name="pendingLocationNameDescription" onChange={changePendingLocationNameDescription} value={props.pendingLocationNameDescription} placeholder="location name / description" />
              <Form.Text className="text-muted">
                example: Space Needle, Pike Place Market, Fremont Troll
</Form.Text>
            </Form.Group>

          </Col>

          <Col xs="auto">
            STEP<br />
            3
      </Col>
          <Col xs={1}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>IMAGE</Form.Label>  <Badge variant="info">OPTIONAL</Badge>

              <input type="file" id="fileSelector"></input>
              <Form.Text className="text-muted">
                Only images are currently supported. Video, YouTube links, and Instagram links will be added soon!
</Form.Text>

            </Form.Group>
          </Col>

          <Col xs="auto">
            STEP<br />
            4
      </Col>
          <Col xs={1}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>&nbsp;</Form.Label>
              <br />
              {/* <button>Submit Location</button> */}

              {/* <Button onClick={handleSubmit} variant="success" size="lg">SUBMIT LOCATION</Button> */}

              <ButtonM
                variant="contained"
                color="primary"
                className={classes.button}
                // endIcon={<Icon>send</Icon>}
                onClick={handleSubmit}
              >
                SUBMIT LOCATION <AddLocation />
      </ButtonM>
            </Form.Group>
          </Col>


        </Row>
      </Container>

    </Form>


  );
}