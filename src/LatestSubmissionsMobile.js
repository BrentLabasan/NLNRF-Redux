import React, { useState } from 'react';
import moment from 'moment';

export default function LatestSubmissionsMobile(props) {
    // Declare a new state variable, which we'll call "count"
    const [count, setCount] = useState(0);

    const listStyle = {
        listStyleType: 'none',
        color: 'white',
        fontWeight: 'bold'
    };

    const style = {
        padding: '10px 20px 10px 20px',
        border: '1px solid grey',
        // backgroundColor: 'grey',
        borderRadius: '10px',
        margin: '0 0 20px 0',
        cursor: 'pointer'
    };

    function compare(a, b) {
        // debugger;
        // console.log('HMMM', moment(a.dateTime).format(), moment(b.dateTime).format());
        // console.log('return value', a.dateTime > b.dateTime ? 1 : -1);
        return a.dateTime < b.dateTime ? 1 : -1;
    }

    // debugger;
    // console.table(props.locations.slice(0, 10).sort(compare));
    let sorted = props.locations.sort(compare).slice(0, 7);
    const latestSubmissions = sorted.map((loc) => {
        // debugger;
        return (
            <li
                style={style}
                className='latestLi'
                onClick={() => handleClick(loc)}
                onMouseEnter={() => handleOnMouseEnter(loc.geopoint)}
                onMouseLeave={handleOnMouseLeave}>
                    {loc.nameDescr}
                    <br />
                    {moment(loc.dateTime).fromNow()}

            </li>
        );
    });

    function handleClick(loc) {
        props.clickLatestSubmissionLi(loc);
    }

    function handleOnMouseEnter(geopoint) {
        console.log('a');
        props.setIsPulseVisible(true, geopoint);
        // props.setPulseLagLong(geopoint);
    }

    function handleOnMouseLeave() {
        console.log('a');
        props.setIsPulseVisible(false);

    }


    return (
        <div>
            {/* <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button> */}

            <ul style={listStyle}>
                {latestSubmissions}
            </ul>

        </div>
    );
}