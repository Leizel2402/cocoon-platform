declare module 'mapbox-gl' {
  export interface Map {
    addControl(control: any, position?: string): void;
    removeControl(control: any): void;
    setStyle(style: string): void;
    getCenter(): { lng: number; lat: number };
    getZoom(): number;
    flyTo(options: { center: [number, number]; zoom: number }): void;
    fitBounds(bounds: LngLatBounds, options?: { padding?: number }): void;
    on(event: string, handler: (e: any) => void): void;
    off(event: string, handler: (e: any) => void): void;
    remove(): void;
    getSource(id: string): any;
    addSource(id: string, source: any): void;
    removeSource(id: string): void;
    getLayer(id: string): any;
    addLayer(layer: any): void;
    removeLayer(id: string): void;
  }

  export interface LngLatBounds {
    extend(point: [number, number]): LngLatBounds;
  }

  export interface Marker {
    setLngLat(coordinates: [number, number]): Marker;
    setPopup(popup: Popup): Marker;
    addTo(map: Map): Marker;
    remove(): void;
  }

  export interface Popup {
    setHTML(html: string): Popup;
  }

  export interface NavigationControl {
    // Navigation control interface
  }

  export let accessToken: string;
  export const Map: new (options: any) => Map;
  export const Marker: new (element?: HTMLElement) => Marker;
  export const Popup: new (options?: any) => Popup;
  export const NavigationControl: new () => NavigationControl;
  export const LngLatBounds: new (sw: [number, number], ne: [number, number]) => LngLatBounds;
}

declare module '@mapbox/mapbox-gl-draw' {
  export interface MapboxDraw {
    changeMode(mode: string): void;
    deleteAll(): void;
    getAll(): { features: any[] };
  }

  export const modes: any;
  export default class MapboxDraw {
    static modes: any;
    constructor(options?: any);
    changeMode(mode: string): void;
    deleteAll(): void;
    getAll(): { features: any[] };
  }
}
