import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Input, OutlinedInput, Tooltip } from '@material-ui/core';
import moment from 'moment';
import { SRLWrapper } from "simple-react-lightbox";


export default function LocationDetails(props) {


    function elLocationMedia() {
        if (props.selectedLocation?.mediaUrl) {
            const style = { 
                maxWidth: '300px',
                cursor: 'pointer'
            };

            return (
                <SRLWrapper>
                    <Tooltip title="click to expand" arrow>
                    <img src={props.selectedLocation.mediaUrl} style={style} />
                    </Tooltip>
                    
                </SRLWrapper>

            );
        } else {
            return <span style={{ display: 'inline-flex', border: '2px solid #f5f5f5', textAlign: 'center', padding: '20px', borderRadius: '5px', color: '#9a9a9a', fontWeight: 'bold', width: '200px', height: '200px', alignItems: 'center', justifyContent: 'center' }}>
                NO MEDIA SUBMITTED
            </span>
        }
    }

    console.log("LocationDetailsMobile.js render");

    return (
        <div>
            <div>
                {/* {props.selectedLocation?.mediaUrl && <img src={props.selectedLocation.mediaUrl} style={{ maxWidth: '300px' }} />} */}
                {elLocationMedia()}
            </div>

            <br />
            <br />

            {props.selectedLocation?.dateTime && <FormControl>
                <InputLabel htmlFor="component-outlined">Name / Description</InputLabel>
                <Input id="component-outlined" value={props.selectedLocation?.nameDescr} label="Name" defaultValue="no name or description provided" />
            </FormControl>}
            {/* <h4>DATETIME</h4> */}
            <br />
            <br />
            {/* { moment(new Date()).format() } */}
            {/* { props.selectedLocation?.dateTime && moment( props.selectedLocation?.dateTime ).format() } */}

            {/* {props.selectedLocation?.dateTime && moment(props.selectedLocation?.dateTime).fromNow()} */}
            {props.selectedLocation?.dateTime && <FormControl>
                <InputLabel htmlFor="component-outlined">Date & Time</InputLabel>
                <Input id="component-outlined" value={moment(props.selectedLocation?.dateTime).fromNow()} label="Name" />
            </FormControl>}

            {/* <br />
            <br />


            <FormControl>
                <InputLabel htmlFor="component-outlined">Visual Type</InputLabel>
                <Input id="component-outlined" value={'VALUE'} label="VisualType" />
            </FormControl> */}



            {/* <h4>CHANCE THAT VISUALIZATION IS STILL RUNNING</h4>
            <p>
                TODO scale from 0% - 100%
  </p> */}

        </div>
    );
}