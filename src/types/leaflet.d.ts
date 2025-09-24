declare module 'react-leaflet' {
  export const Map: any;
  export const TileLayer: any;
  export const Marker: any;
  export const Popup: any;
  export const FeatureGroup: any;
}

declare module 'react-leaflet-draw' {
  export const EditControl: any;
}

declare module 'react-leaflet-fullscreen' {
  const FullscreenControl: any;
  export default FullscreenControl;
}
