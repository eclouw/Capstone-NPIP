import {APIProvider} from '@vis.gl/react-google-maps';
import {Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';
import React from 'react';
import GMapMarkers from './GMapMarker.tsx';



type Poi ={ key: string, location: google.maps.LatLngLiteral, status: number }
const locations: Poi[] = [
  {key: 'operaHouse',location: { lat: 30, lng: 31  }, status: 1},
  {key: 'tarongaZoo', location: { lat: -33.8472767, lng: 18 }, status: 2},
  {key: 'manlyBeach', location: { lat: -1, lng: 18 }, status: 2},
  {key: 'hyderPark', location: { lat:5, lng: -0.18 }, status: 1},
  {key: 'theRocks', location: { lat: 6.5, lng: 3.37 }, status: 2},
  {key: 'circularQuay', location: { lat: 9.14, lng: 40 }, status: 2},
  {key: 'harbourBridge', location: { lat: 36, lng: 3 }, status: 1},
  {key: 'kingsCross', location: { lat: 14, lng: -17 }, status: 1},
  {key: 'botanicGardens', location: { lat: -4, lng: 15 }, status: 2},
  {key: 'museumOfSydney', location: { lat: -6, lng: 39 }, status: 1},
];

const GMap = () =>{

  function test(){

  }

    return(
      <>
      <div className='map-container'>
        <APIProvider apiKey={'AIzaSyAOqNFQrg3e1paiAJoAVGPQ_9Zu8rzf7og'} onLoad={() => console.log('Maps API has loaded.')}>
        <Map
          mapId='DEMO_MAP_ID'
          defaultZoom={2}
          defaultCenter={ { lat: -0.00665793088812781, lng: 17.856514443765818 } }
          onCameraChanged={ (ev: MapCameraChangedEvent) =>
          console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
          }> 
            <GMapMarkers pois={locations} ></GMapMarkers>
        </Map>

        </APIProvider>
        
      </div>
      </>
    )
      

}

export default GMap;