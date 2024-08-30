import {APIProvider} from '@vis.gl/react-google-maps';
import {Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';

const GMap = () =>{
    
    
    
    return(
      <div className='map-container'>
        <APIProvider apiKey={'AIzaSyAZtWQe5IPX-2zR01ANR-y-WCvjMi9uOdQ'} onLoad={() => console.log('Maps API has loaded.')}>
        <Map
          defaultZoom={13}
          defaultCenter={ { lat: -33.860664, lng: 151.208138 } }
          onCameraChanged={ (ev: MapCameraChangedEvent) =>
          console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
          }>
        </Map>

        </APIProvider>
        
      </div>
    )
      

}

export default GMap;