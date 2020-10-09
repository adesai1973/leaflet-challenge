// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Define arrays to hold created earthquale circle markers
var quakeMarkers = [];
var quakes = [];

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function

  //console.log(data);
  createFeatures(data.features, quakeMarkers);

});

// Function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
    return magnitude * 20000;
  }

  // Function to determine marker color based on earthquake magnitude
function markerColor(magnitude) {
    var circleColor = "black";

    if (magnitude > 4){
        circleColor = "crimson";
    } else if (magnitude > 3){
        circleColor = "coral";
    } else if (magnitude > 2){
        circleColor = "chocolate";
    } else if (magnitude > 1){
        circleColor = "aqua";
    } else {
        circleColor = "chartreuse";
    }
    return circleColor;
  }



function createFeatures(earthquakeData, quakeMarkers) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.mag + "</h3><hr><p>" + feature.properties.place +
      "<hr><p>" + new Date(feature.properties.time) + "</p>");

    //console.log(feature.geometry.coordinates);
    quakeMarkers.push(
    L.circle([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], {
        stroke: true,
        fillOpacity: 0.8,
        color: "black",
        weight: 1,
        fillColor: markerColor(feature.properties.mag),
        radius: markerSize(feature.properties.mag)
    })
    );
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {

    onEachFeature: onEachFeature
  });

  //console.log(quakeMarkers);
  // Create layer group for earthquake magnitude circles
  quakes = L.layerGroup(quakeMarkers);



  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}



function createMap(earthquakes) {
  console.log(quakes);
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": quakes,
    "Earthquakes2": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, quakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [0,1,2,3,4];
        var colors = ["chartreuse", "aqua", "chocolate", "coral", "crimson"];
        var labels = [];

        // Add min & max
        var legendInfo = "<h1>Earthquake Magnitude</h1>" +
        "<div class=\"labels\">" +
            "<div class=\"max\">" + (limits[4]+1) + "</div>" +
            "<div class=\"min\">" + limits[0] + "</div>" +
        "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\">" + "&nbsp" + limit + "-" + (limit+1) + "</li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);

}
