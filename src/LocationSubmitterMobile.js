import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Container, Row, Col, Dropdown, DropdownButton, ToggleButtonGroup, ToggleButton, Badge } from 'react-bootstrap';
import { Backdrop, Button as ButtonM } from '@material-ui/core';
import { LocationOn, AddLocation, Favorite, AccountCircle, Photo } from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as firebase from 'firebase';
import 'firebase/firestore';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import useInput from './hookUseInput';


export default function LocationSubmitterMobile(props) {
  const { value: locationNameDescription, bind: bindLocationNameDescription, reset: resetlocationNameDescription } = useInput('');


  const [open, setOpen] = useState(false);
  const [nameDescr, setNameDescr] = useState('');

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
      nameDescr: nameDescr,
      geopoint: new firebase.firestore.GeoPoint(props.latLong.latitude, props.latLong.longitude),
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

        // TO UPDATE
        // props.handlePendingLatLongChange('', '');
        // props.handlePendingLocationNameDescription('');


        if (document.getElementById('fileSelector').files[0]) {
          let file = document.getElementById('fileSelector').files[0];

          const guid = uuidv4();
          var pendingMediaRef = props.storageRef.child('locations/' + guid);

          pendingMediaRef.put(file).then((snapshot) => {
            console.log(`Media uploaded successfully :) GUID: ${guid}`);
            console.log(snapshot);

            // ERROR after a successful mobile location submit, after a few secs I got the error TypeError: Cannot set property 'value' of null
            if (document.getElementById('fileSelector')) {
              document.getElementById('fileSelector').value = null;
            }
            

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

        // setOpen(false);
        alert("Location submitted successfully!");
        props.handleClose();
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });

  }

  function changePendingLocationNameDescription(e) {
    e.preventDefault();

    setNameDescr(e.target.value);
  }

  function inputLatLongVal() {
    debugger;
    return props.latLong ? (props.latLong.latitude + ', ' + props.latLong.longitude) : '*';
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


            STEP 1


          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="formBasicEmail">

              <Form.Label>LATITUDE / LONGITUDE</Form.Label> 
              {/* <Badge variant="danger">REQUIRED</Badge> */}

              <Form.Control type="text" name="pendingLatitude" placeholder="latitude" value={inputLatLongVal()} />
              <Form.Text className="text-muted">
                These coordinates are automatically filled out.
</Form.Text>
            </Form.Group>
          </Col>
          </Row>
          <Row>

          <Col xs="auto">
            STEP
            2
      </Col>
      </Row>
      <Row>

          <Col>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>LOCATION NAME / DESCRIPTION</Form.Label> <Badge variant="danger">REQUIRED</Badge>
              <Form.Control type="text" name="pendingLocationNameDescription" onChange={changePendingLocationNameDescription} value={nameDescr} placeholder="location name / description" />
              <Form.Text className="text-muted">
                example: Space Needle, Pike Place Market, Fremont Troll
</Form.Text>
            </Form.Group>

          </Col>
          </Row>
          <Row>

          <Col xs="auto">
            STEP
            3
      </Col>
      </Row>
      <Row>
          <Col>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>IMAGE</Form.Label>  <Badge variant="info">OPTIONAL</Badge>

              <input type="file" id="fileSelector"></input>
              <Form.Text className="text-muted">
                Only images are currently supported. Video, YouTube links, and Instagram links will be added soon!
</Form.Text>

            </Form.Group>
          </Col>
          </Row>
          <Row>

          <Col xs="auto">
            STEP
            4
      </Col>
      </Row>
      <Row>
          <Col >
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