import L from 'leaflet';

// This is to fix an issue with the default icon paths in Leaflet
// The webpack bundling process breaks the default paths to marker icons
// This fix sets the correct paths for the default icons
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

export default fixLeafletIcons; 