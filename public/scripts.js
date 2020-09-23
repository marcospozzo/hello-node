// initializing the map
const mymap = L.map('mapid').setView([0, 0], 2);
// const mymap = L.map('mapid').setView([-40, -60], 4); // Argentina approximately
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(mymap);
const marker = L.marker([0, 0]);
const circle = L.circle([0, 0]);
let positionData = {};

function getLocation() {
  if ('geolocation' in navigator) {
    console.log('geolocation is available');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const timestamp = position.timestamp;
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        positionData = { timestamp, lat, long, accuracy };
        document.getElementById('latitude').textContent = `${lat}\xB0`;
        document.getElementById('longitude').textContent = `${long}\xB0`;
        marker.setLatLng([lat, long]).addTo(mymap);
        setMapViewBasedOnAccuracy(positionData);
      },
      (err) => {
        console.error(err);
      }
    );
  } else {
    console.log('geolocation IS NOT available');
  }
}

function setMapViewBasedOnAccuracy(positionData) {
  const accuracyInDeg = positionData.accuracy / 1000 / 100; // meters to km to deg, very approximately
  const corner1 = L.latLng(
    positionData.lat + accuracyInDeg,
    positionData.long + accuracyInDeg
  );
  const corner2 = L.latLng(
    positionData.lat - accuracyInDeg,
    positionData.long - accuracyInDeg
  );
  const bounds = L.latLngBounds(corner1, corner2);
  mymap.flyToBounds(bounds);
  mymap.on('zoomend', () => {
    circle.setRadius(positionData.accuracy);
    circle.setLatLng([positionData.lat, positionData.long]).addTo(mymap);
  });
}

async function sendLocation() {
  const name = document.getElementById('name').value;
  positionData.name = name;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(positionData),
  };

  const response = await fetch('/api', options);
  const json = await response.json();
  console.log('Location sent!');
  document.getElementById('name').value = '';
  getData();
}

async function getData() {
  document.getElementById('database').textContent = '';
  const response = await fetch('/api');
  const data = await response.json();

  for (item in data) {
    const root = document.createElement('p');
    const name = document.createElement('div');
    const lat = document.createElement('div');
    const long = document.createElement('div');
    const timestamp = document.createElement('div');
    const accuracy = document.createElement('div');

    name.textContent = `name: ${data[item].name}`;
    lat.textContent = `latitude: ${data[item].lat}`;
    long.textContent = `longitude: ${data[item].long}`;
    const dateString = new Date(data[item].timestamp).toLocaleString();
    timestamp.textContent = `timestamp: ${dateString}`;
    accuracy.textContent = `accuracy: ${data[item].accuracy}`;

    root.append(name, timestamp, lat, long, accuracy);
    document.getElementById('database').append(root);
  }
}
