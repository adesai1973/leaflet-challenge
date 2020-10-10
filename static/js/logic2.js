// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var queryUrl2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Define arrays to hold created earthquale circle markers
var quakeMarkers = [];
var faultMarkers = [];
var quakes = [];
var faultLine = [];
var count = 0;

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    //console.log(data);
  d3.json(queryUrl2, function(data2) {
  //console.log(data2);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features, quakeMarkers, data2.features);
  });
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



function createFeatures(earthquakeData, quakeMarkers, faultData) {

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
    
    function onEachFeature2(feature, layer) {
      //layer.bindPopup("<h3>" + feature.properties.mag + "</h3><hr><p>" + feature.properties.place +
      //  "<hr><p>" + new Date(feature.properties.time) + "</p>");

      //console.log(feature.geometry.coordinates);
      faultLine.push(feature.geometry.coordinates);
      count += 1;
      //console.log(count);
      faultMarkers.push(
        L.polyline(faultLine, {color: 'DarkOrange', weight: 1})
      );
    }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {

    onEachFeature: onEachFeature
  });

  var faultsarray = L.geoJSON(faultData, {

    onEachFeature: onEachFeature2
  });

  //console.log(faultMarkers);
  // Create layer group for earthquake magnitude circles
  quakes = L.layerGroup(quakeMarkers);
  faults = L.layerGroup(faultMarkers);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, faultLine);
}

function getColor(d) {
  return d > 1000 ? '#800026' :
         d > 500  ? '#BD0026' :
         d > 200  ? '#E31A1C' :
         d > 100  ? '#FC4E2A' :
         d > 50   ? '#FD8D3C' :
         d > 20   ? '#FEB24C' :
         d > 10   ? '#FED976' :
                    '#FFEDA0';
}

function createMap(earthquakes, faultLine) {


  // Define streetmap and darkmap layers
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
  });

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Gray": graymap,
    "Outdoors": outdoorsmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": quakes,
    "Earthquake Info": earthquakes,
    "FaultLines": faults
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellitemap, quakes]
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

    // var myLines = [{
    //     "type": "LineString",
    //     "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
    // }, {
    //     "type": "LineString",
    //     "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
    // }];

    console.log(count);
    //faultss = L.layerGroup(polyline(faultLine));
    polyline(faultLine);
    //console.log(faultss);
    
    function polyline(faultLine) {
      var i = 0;
      var myStyle = {};
      var faultLines = [];
      var polylines = [];
      for (i=0; i<count; i++) {

        //console.log("Loop iteration: " + i);
        //console.log(faultLine[i]);
        //polylines = L.polyline(faultLine[i], {color: 'DarkOrange'});
        //console.log(polylines);

        faultLines = [{
          "type": "LineString",
          "coordinates": faultLine[i]
          //"coordinates": [[-0.4379, -54.8518], [-0.038826, -54.6772], [0.443182, -54.4512], [0.964534, -54.8322], [1.69481, -54.399], [2.35975, -54.0374], [3.02542, -53.6507], [3.36894, -53.8341], [3.95638, -54.1267], [4.41458, -54.4303]
          //,[7.77235, -54.396], [8.28834, -54.0326], [8.79876, -53.668], [9.42869, -53.2326], [9.99306, -52.7923], [10.5424, -53.0655], [10.9748, -53.332], [11.7084, -52.7829], [12.2989, -52.375], [12.8951, -51.9629]
          //,[32.1258, -46.9998], [31.8654, -47.2011], [31.5885, -47.6822]]
        }];
        //console.log(faultLines);
        myStyle = {
            "color": "DarkOrange",
            "weight": 2,
            "opacity": 0.65
        };
        
        L.geoJSON(faultLines, {
            style: myStyle
        }).addTo(myMap);
      }
    }
}
