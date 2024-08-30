import {APIProvider} from '@vis.gl/react-google-maps';
import {Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';

const GMap = () =>{
    
    
    
    return(
      <div className='map-container'>
        <APIProvider apiKey={'AIzaSyAZtWQe5IPX-2zR01ANR-y-WCvjMi9uOdQ'} onLoad={() => console.log('Maps API has loaded.')}>
        <Map
          defaultZoom={2}
          defaultCenter={ { lat: -0.00665793088812781, lng: 17.856514443765818 } }
          onCameraChanged={ (ev: MapCameraChangedEvent) =>
          console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
          }>
        </Map>

        </APIProvider>
        
      </div>
    )
      

}

export default GMap;