// PixelProdigy AI - Google Maps Integration
// "Their Prefab, My World" - Interactive GeoSpatial Metaverse

import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with actual key
  elevationApiUrl: 'https://maps.googleapis.com/maps/api/elevation/json',
  weatherApiKey: 'YOUR_OPENWEATHER_API_KEY',
  noaaAuroraUrl: 'https://services.swpc.noaa.gov/products/noaa-scales.json',
  
  // District definitions
  districts: {
    skyMansions: {
      name: 'Sky Mansions District 01',
      region: 'Greenland',
      center: { lat: 64.1836, lng: -51.7214 },
      elevation: { min: 2000, max: 10000 },
      totalPlots: 1000,
      claimedPlots: 1, // Jeremy's mansion
      specialty: 'Northern Lights Viewing'
    },
    beachHouses: {
      name: 'Beach Houses District 02',
      region: 'Malibu, California',
      center: { lat: 34.0259, lng: -118.7798 },
      elevation: { min: 0, max: 100 },
      totalPlots: 1000,
      claimedPlots: 0,
      specialty: 'Sunset Viewing & Surfing'
    },
    urbanPenthouses: {
      name: 'Urban Penthouses District 03',
      region: 'New York City',
      center: { lat: 40.7128, lng: -74.0060 },
      elevation: { min: 200, max: 500 },
      totalPlots: 1000,
      claimedPlots: 0,
      specialty: 'City Skyline Views'
    }
  },
  
  // Pricing tiers
  pricing: {
    plots1to100: 0.00,
    plots101to500: 9.99,
    plots501to1000: 19.99,
    plotsAfter1000: 49.99
  }
};

// ============================================
// GOOGLE MAPS LOADER
// ============================================

class GoogleMapsLoader {
  constructor() {
    this.loader = new Loader({
      apiKey: CONFIG.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
    this.map = null;
    this.markers = [];
  }
  
  async initialize(elementId) {
    const { Map } = await this.loader.load();
    
    // Create map centered on Sky Mansions District
    this.map = new Map(document.getElementById(elementId), {
      center: CONFIG.districts.skyMansions.center,
      zoom: 6,
      mapTypeId: 'satellite', // Start with satellite view
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      styles: this.getCustomMapStyle()
    });
    
    return this.map;
  }
  
  getCustomMapStyle() {
    // Custom styling to highlight claimable areas
    return [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#193341' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#2c5a71' }]
      }
    ];
  }
  
  async addPropertyMarker(property) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
    
    // Create custom marker
    const markerDiv = document.createElement('div');
    markerDiv.className = 'property-marker';
    markerDiv.innerHTML = `
      <div class="marker-content ${property.claimed ? 'claimed' : 'available'}">
        <div class="plot-number">#${property.plotNumber}</div>
        <div class="property-name">${property.name}</div>
        <div class="property-price">${this.getPrice(property.plotNumber)}</div>
      </div>
    `;
    
    const marker = new AdvancedMarkerElement({
      map: this.map,
      position: { lat: property.latitude, lng: property.longitude },
      content: markerDiv,
      title: property.name
    });
    
    // Click handler
    marker.addListener('click', () => {
      this.showPropertyDetails(property);
    });
    
    this.markers.push(marker);
    return marker;
  }
  
  getPrice(plotNumber) {
    if (plotNumber <= 100) return 'FREE';
    if (plotNumber <= 500) return '$9.99';
    if (plotNumber <= 1000) return '$19.99';
    return '$49.99';
  }
  
  showPropertyDetails(property) {
    // Create info window with property details
    const infoWindow = new google.maps.InfoWindow({
      content: this.generatePropertyHTML(property)
    });
    
    infoWindow.open({
      map: this.map,
      position: { lat: property.latitude, lng: property.longitude }
    });
  }
  
  generatePropertyHTML(property) {
    return `
      <div class="property-info">
        <h2>${property.name}</h2>
        <p><strong>Plot:</strong> #${property.plotNumber}</p>
        <p><strong>District:</strong> ${property.district}</p>
        <p><strong>Elevation:</strong> ${property.elevation}m</p>
        <p><strong>Status:</strong> ${property.claimed ? '🔴 CLAIMED' : '🟢 AVAILABLE'}</p>
        ${property.claimed ? `
          <p><strong>Owner:</strong> @${property.owner}</p>
        ` : `
          <p><strong>Price:</strong> ${this.getPrice(property.plotNumber)}</p>
          <button onclick="claimProperty('${property.propertyId}')">Claim This Plot</button>
        `}
        <button onclick="view3DPreview('${property.propertyId}')">View 3D Preview</button>
      </div>
    `;
  }
}

// ============================================
// TERRAIN DATA FETCHER
// ============================================

class TerrainDataFetcher {
  constructor() {
    this.cache = new Map();
  }
  
  async getElevationData(coordinates, radius = 5000) {
    const cacheKey = `${coordinates.lat},${coordinates.lng},${radius}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Generate grid points around center
    const gridSize = 64; // 64x64 grid for detailed terrain
    const points = this.generateGridPoints(coordinates, radius, gridSize);
    
    // Fetch elevation data from Google
    const elevationData = await this.fetchElevations(points);
    
    this.cache.set(cacheKey, elevationData);
    return elevationData;
  }
  
  generateGridPoints(center, radius, gridSize) {
    const points = [];
    const step = (radius * 2) / gridSize;
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Convert to lat/lng offset
        const latOffset = ((x - gridSize / 2) * step) / 111320; // degrees
        const lngOffset = ((z - gridSize / 2) * step) / (111320 * Math.cos(center.lat * Math.PI / 180));
        
        points.push({
          lat: center.lat + latOffset,
          lng: center.lng + lngOffset
        });
      }
    }
    
    return points;
  }
  
  async fetchElevations(points) {
    // Google Elevation API has 512 location limit per request
    const chunks = this.chunkArray(points, 512);
    const results = [];
    
    for (const chunk of chunks) {
      const locations = chunk.map(p => `${p.lat},${p.lng}`).join('|');
      
      const response = await fetch(
        `${CONFIG.elevationApiUrl}?locations=${locations}&key=${CONFIG.googleMapsApiKey}`
      );
      
      const data = await response.json();
      
      if (data.results) {
        results.push(...data.results.map(r => r.elevation));
      }
    }
    
    return results;
  }
  
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// ============================================
// 3D MESH GENERATOR
// ============================================

class MeshGenerator {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
  
  generateTerrainMesh(elevationData, gridSize = 64) {
    // Create heightmap geometry
    const geometry = new THREE.PlaneGeometry(
      10000, // width in meters
      10000, // height in meters
      gridSize - 1, // width segments
      gridSize - 1  // height segments
    );
    
    // Apply elevation data to vertices
    const vertices = geometry.attributes.position.array;
    
    for (let i = 0; i < elevationData.length; i++) {
      const vertexIndex = i * 3 + 2; // Z component
      vertices[vertexIndex] = elevationData[i]; // Set elevation
    }
    
    // Recalculate normals for proper lighting
    geometry.computeVertexNormals();
    
    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: false
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; // Rotate to horizontal
    
    return mesh;
  }
  
  async loadPropertyMesh(propertyData) {
    // Load GLTF model for property
    const loader = new THREE.GLTFLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        propertyData.modelPath,
        (gltf) => {
          const model = gltf.scene;
          
          // Position at GPS coordinates
          const position = this.gpsToWorldPosition(
            propertyData.latitude,
            propertyData.longitude,
            propertyData.elevation
          );
          
          model.position.set(position.x, position.y, position.z);
          
          resolve(model);
        },
        undefined,
        reject
      );
    });
  }
  
  gpsToWorldPosition(lat, lng, elevation) {
    // Convert GPS coordinates to 3D world space
    // Using simple mercator projection for demo
    const x = lng * 111320; // meters per degree longitude at equator
    const z = lat * 110540; // meters per degree latitude
    const y = elevation;
    
    return { x, y, z };
  }
  
  async compositeScene(terrainMesh, propertyMeshes) {
    // Add terrain to scene
    this.scene.add(terrainMesh);
    
    // Add all properties
    for (const property of propertyMeshes) {
      this.scene.add(property);
    }
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 1000, 100);
    this.scene.add(directionalLight);
    
    // Add sky
    const skyGradient = this.createSkyGradient();
    this.scene.add(skyGradient);
    
    return this.scene;
  }
  
  createSkyGradient() {
    const skyGeometry = new THREE.SphereGeometry(50000, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    return new THREE.Mesh(skyGeometry, skyMaterial);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================
// WEATHER INTEGRATION
// ============================================

class WeatherSystem {
  async getCurrentWeather(coordinates) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${CONFIG.weatherApiKey}&units=metric`
    );
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      windSpeed: data.wind.speed,
      humidity: data.main.humidity,
      cloudCover: data.clouds.all
    };
  }
  
  async getAuroraForecast() {
    const response = await fetch(CONFIG.noaaAuroraUrl);
    const data = await response.json();
    
    // Parse NOAA scale data
    const kpIndex = data['0']?.['Kp']; // Current Kp index
    
    return {
      kpIndex: kpIndex || 0,
      visible: kpIndex >= 4,
      intensity: this.getAuroraIntensity(kpIndex),
      forecast: kpIndex >= 4 ? 'High probability of aurora visibility' : 'Low aurora activity'
    };
  }
  
  getAuroraIntensity(kpIndex) {
    if (kpIndex < 4) return 'None';
    if (kpIndex < 5) return 'Weak';
    if (kpIndex < 6) return 'Moderate';
    if (kpIndex < 7) return 'Strong';
    return 'Extreme';
  }
  
  async applyWeatherToScene(scene, weather) {
    // Apply weather effects to 3D scene
    if (weather.conditions === 'Rain') {
      this.addRainEffect(scene);
    } else if (weather.conditions === 'Snow') {
      this.addSnowEffect(scene);
    } else if (weather.conditions === 'Clouds') {
      this.addClouds(scene, weather.cloudCover);
    }
  }
  
  addRainEffect(scene) {
    // Particle system for rain
    const particleCount = 10000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1000;
      positions[i + 1] = Math.random() * 500;
      positions[i + 2] = (Math.random() - 0.5) * 1000;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 2,
      transparent: true,
      opacity: 0.6
    });
    
    const rain = new THREE.Points(particles, material);
    scene.add(rain);
  }
  
  addSnowEffect(scene) {
    // Similar to rain but slower falling
    const particleCount = 5000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1000;
      positions[i + 1] = Math.random() * 500;
      positions[i + 2] = (Math.random() - 0.5) * 1000;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 5,
      transparent: true,
      opacity: 0.8
    });
    
    const snow = new THREE.Points(particles, material);
    scene.add(snow);
  }
}

// ============================================
// MAIN APPLICATION
// ============================================

class PixelProdigyWorld {
  constructor() {
    this.mapsLoader = new GoogleMapsLoader();
    this.terrainFetcher = new TerrainDataFetcher();
    this.meshGenerator = new MeshGenerator();
    this.weatherSystem = new WeatherSystem();
    
    this.properties = [];
  }
  
  async initialize() {
    // Initialize Google Maps
    await this.mapsLoader.initialize('map');
    
    // Load all properties
    await this.loadProperties();
    
    // Start weather updates
    this.startWeatherUpdates();
    
    console.log('PixelProdigy World initialized! 🌍');
  }
  
  async loadProperties() {
    // Load Jeremy's Sky Mansion (Plot #1)
    const skyMansion = {
      propertyId: 'MYPLACE_SKY_MANSION_001',
      plotNumber: 1,
      name: "Jeremy's Sky Mansion",
      district: 'Sky Mansions District 01',
      latitude: 64.1836,
      longitude: -51.7214,
      elevation: 3048,
      claimed: true,
      owner: 'eugeneousxr',
      modelPath: '/models/sky_mansion.gltf'
    };
    
    this.properties.push(skyMansion);
    await this.mapsLoader.addPropertyMarker(skyMansion);
    
    // Generate 99 more available plots around Greenland
    for (let i = 2; i <= 100; i++) {
      const property = this.generatePlot(i, 'skyMansions');
      this.properties.push(property);
      await this.mapsLoader.addPropertyMarker(property);
    }
  }
  
  generatePlot(plotNumber, districtType) {
    const district = CONFIG.districts[districtType];
    
    // Random offset from district center
    const latOffset = (Math.random() - 0.5) * 2; // ±1 degree
    const lngOffset = (Math.random() - 0.5) * 4; // ±2 degrees
    
    return {
      propertyId: `MYPLACE_${districtType.toUpperCase()}_${plotNumber.toString().padStart(3, '0')}`,
      plotNumber,
      name: `${district.name} - Plot #${plotNumber}`,
      district: district.name,
      latitude: district.center.lat + latOffset,
      longitude: district.center.lng + lngOffset,
      elevation: Math.random() * (district.elevation.max - district.elevation.min) + district.elevation.min,
      claimed: false,
      owner: null,
      modelPath: null
    };
  }
  
  async view3DPreview(propertyId) {
    const property = this.properties.find(p => p.propertyId === propertyId);
    if (!property) return;
    
    // Fetch terrain data
    const elevationData = await this.terrainFetcher.getElevationData({
      lat: property.latitude,
      lng: property.longitude
    });
    
    // Generate terrain mesh
    const terrainMesh = this.meshGenerator.generateTerrainMesh(elevationData);
    
    // Load property mesh if claimed
    const propertyMeshes = [];
    if (property.claimed && property.modelPath) {
      const propertyMesh = await this.meshGenerator.loadPropertyMesh(property);
      propertyMeshes.push(propertyMesh);
    }
    
    // Composite scene
    const scene = await this.meshGenerator.compositeScene(terrainMesh, propertyMeshes);
    
    // Apply weather
    const weather = await this.weatherSystem.getCurrentWeather({
      lat: property.latitude,
      lng: property.longitude
    });
    await this.weatherSystem.applyWeatherToScene(scene, weather);
    
    // Start animation
    this.meshGenerator.animate();
  }
  
  async claimProperty(propertyId) {
    const property = this.properties.find(p => p.propertyId === propertyId);
    if (!property || property.claimed) return;
    
    // Process claim (would integrate with payment system)
    const price = this.mapsLoader.getPrice(property.plotNumber);
    
    const confirmed = confirm(`Claim ${property.name} for ${price}?`);
    if (!confirmed) return;
    
    // Update property
    property.claimed = true;
    property.owner = 'currentUser'; // Replace with actual user
    
    // Update database (placeholder)
    console.log(`Property ${propertyId} claimed!`);
    
    // Refresh map
    this.mapsLoader.markers.forEach(m => m.setMap(null));
    this.mapsLoader.markers = [];
    await this.loadProperties();
  }
  
  startWeatherUpdates() {
    // Update weather every 15 minutes
    setInterval(async () => {
      for (const property of this.properties.filter(p => p.claimed)) {
        const weather = await this.weatherSystem.getCurrentWeather({
          lat: property.latitude,
          lng: property.longitude
        });
        
        // Check aurora for arctic properties
        if (property.latitude > 60 || property.latitude < -60) {
          const aurora = await this.weatherSystem.getAuroraForecast();
          if (aurora.visible) {
            this.notifyOwner(property.owner, `Northern Lights visible at ${property.name}! 🌌`);
          }
        }
      }
    }, 15 * 60 * 1000);
  }
  
  notifyOwner(owner, message) {
    console.log(`[Notification to ${owner}]: ${message}`);
    // Would integrate with notification system
  }
}

// ============================================
// EXPORT
// ============================================

export { PixelProdigyWorld, GoogleMapsLoader, MeshGenerator, WeatherSystem };

// Initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    const world = new PixelProdigyWorld();
    await world.initialize();
    
    // Expose globally for HTML onclick handlers
    window.claimProperty = (id) => world.claimProperty(id);
    window.view3DPreview = (id) => world.view3DPreview(id);
  });
}
