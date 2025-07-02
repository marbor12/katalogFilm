import CONFIG from "../config"
import L from "leaflet"

class MapUtils {
  constructor() {
    this.map = null
    this.markers = []
    this.selectedLocation = null
  }

  initializeMap(containerId, options = {}) {
    const defaultOptions = {
      center: [CONFIG.DEFAULT_LOCATION.lat, CONFIG.DEFAULT_LOCATION.lng],
      zoom: 10,
      ...options,
    }

    this.map = L.map(containerId).setView(defaultOptions.center, defaultOptions.zoom)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)

    return this.map
  }

  addMarker(lat, lng, popupContent = "", options = {}) {
    const marker = L.marker([lat, lng], options).addTo(this.map)

    if (popupContent) {
      marker.bindPopup(popupContent)
    }

    this.markers.push(marker)
    return marker
  }

  addClickListener(callback) {
    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng
      this.selectedLocation = { lat, lng }

      // Remove previous selection marker
      this.clearSelectionMarkers()

      // Add new selection marker
      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).addTo(this.map)

      marker.bindPopup(`Lokasi dipilih: ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup()
      marker._isSelectionMarker = true
      this.markers.push(marker)

      if (callback) {
        callback(lat, lng)
      }
    })
  }

  clearSelectionMarkers() {
    this.markers = this.markers.filter((marker) => {
      if (marker._isSelectionMarker) {
        this.map.removeLayer(marker)
        return false
      }
      return true
    })
  }

  clearAllMarkers() {
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker)
    })
    this.markers = []
  }

  fitBounds(locations) {
    if (locations.length > 0) {
      const group = new L.featureGroup(locations.map((loc) => L.marker([loc.lat, loc.lng])))
      this.map.fitBounds(group.getBounds().pad(0.1))
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
      this.markers = []
    }
  }
}

export default MapUtils
