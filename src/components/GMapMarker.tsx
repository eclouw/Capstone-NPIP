import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps"
import React, { useCallback } from "react"


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

  const handleClick = useCallback((ev: google.maps.MapMouseEvent) => {
    if (!ev.latLng) return;
    console.log('marker clicked: ', ev.latLng.toString());
  }, [])
    return (
      <>
      {props.pois.map( (poi: Poi) => (
        <AdvancedMarker
          clickable={true}
          onClick={handleClick}
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