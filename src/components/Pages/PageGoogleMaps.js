import GMap from '../GMap.tsx';
import NavBar from '../NavBar.js';
import React from 'react';

//Page for displaying the google map, going to be used for more functional things later once data is ready
function PageGoogleMaps(){
    return (
        <>
        <div class="map-container">
            <GMap/>
        </div>
        </>
    )

}

export default PageGoogleMaps;