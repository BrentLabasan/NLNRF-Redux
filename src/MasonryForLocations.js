import React, { useState } from 'react';
// import Masonry from 'react-masonry-css'
import Masonry from 'react-masonry-component';

export default function MasonryForLocations(props) {
  // Declare a new state variable, which we'll call "count"
  //   const [count, setCount] = useState(0);

  function compare(a, b) {
    // debugger;
    // console.log('HMMM', moment(a.dateTime).format(), moment(b.dateTime).format());
    // console.log('return value', a.dateTime > b.dateTime ? 1 : -1);
    return a.dateTime < b.dateTime ? 1 : -1;
  }

  const masonryOptions = {
    transitionDuration: 0
  };

  const imagesLoadedOptions = { background: '.my-bg-image-el' }

  const style = {
    cursor: 'pointer',
    maxWidth: '250px', maxheight: '250px', margin: '0 20px 20px 0', border: '1px solid #333333', padding: '10px', borderRadius: '5px'
  };

  function handleClick(loc) {
    props.clickLatestSubmissionLi(loc);
}

function handleOnMouseEnter(geopoint) {
    // console.log('a');
    props.setIsPulseVisible(true, geopoint);
    // props.setPulseLagLong(geopoint);
}

function handleOnMouseLeave() {
    // console.log('a');
    props.setIsPulseVisible(false);

}

  let array = props.locations.filter(loc => loc.mediaUrl !== null).sort(compare).slice(0, 99);
  let childElements = array.map((loc) => {
    return (
      // <li className="image-element-class">
      <img
        src={loc.mediaUrl}
        style={style}

        onClick={() => handleClick(loc)}
        onMouseEnter={() => handleOnMouseEnter(loc.geopoint)}
        onMouseLeave={handleOnMouseLeave}
      />
      // </li>

    );
  });



  return (
    // <div style={{width: '50%', display: 'inline-flex', justifyContent: 'space-between' }}>
    <div style={{ overflow: 'scroll', height: '700px', overflowX: 'hidden' }} >
      {/* <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button> */}


      {childElements}

    </div>
  );
}