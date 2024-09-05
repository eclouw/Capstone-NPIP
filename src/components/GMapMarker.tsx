import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps"
import React from "react"

interface Poi {
  key: string;
  location: Location;
  status: number;
}

interface Location {
  lat: number;
  lng: number;
}
const GMapMarkers = (props: {pois: Poi[]}) => {
    return (
      <>
      {props.pois.map( (poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}>
            {poi.status == 1 && (
              <Pin background={'#00FF00'} glyphColor={'#000'} borderColor={'#000'} />
            )}
            {poi.status == 2 && (
              <Pin background={'#FF0000'} glyphColor={'#000'} borderColor={'#000'} />
            )}
        </AdvancedMarker>
      ))}
    </>
    )
}

export default GMapMarkers;