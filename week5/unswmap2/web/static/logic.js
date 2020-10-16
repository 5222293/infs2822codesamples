// keep track of Leaflet map for use between functions
var globalMapObject;

// keep track of which map tiles have been selected
var globalCurrentTilesSelection;
var globalCurrentTiles;

// keep track of items added
var globalFeatureIDTracker = {};

// list of items to add
var itemsToAdd = [
	"buildings/quad.geojson"
	, "buildings/scientia-lawn.geojson"
	, "buildings/b16.geojson"
	// , "buildings/c27.geojson" // unbounded LineString
	, "buildings/d26.geojson"
	// , "buildings/e24.geojson" // unbounded LineString
	, "buildings/f23.geojson"
	, "buildings/g14.geojson"
	, "buildings/g17.geojson"
	, "buildings/k15.geojson"
	, "buildings/myers_theatre.geojson"
	, "buildings/botany-street-parking-station.geojson"
	, "buildings/N18_BarkerStreetParking.geojson"
	, "buildings/New_College_L6.geojson"
	, "buildings/roundhouse.geojson"
	, "buildings/international_house.geojson"
	, "buildings/agsm-building.geojson"
	, "buildings/terraces.geojson"
	, "buildings/D16 Goldstein Hall.geojson"
	, "buildings/myers_building.geojson"
	// , "buildings/H20CivilEngineering.geojson" // missing commas
	// , "buildings/k17.geojson" // incorrect shape
];

// UFO sightings 🛸
var globalUFODictionary = {};
var globalMinUFOSightings;
var globalMaxUFOSightings;

// Colours
var weakEndRGB = {red: 0, green: 255, blue: 0};
var midwayRGB = {red: 200, green: 200, blue: 0};
var strongEndRGB = {red: 255, green: 0, blue: 0};

function bodyDidLoad() {
	ShowtimeHelper.setDarkModeAccordingToBrowser();
	ShowtimeHelper.initialiseSelect2();
	
	
	// OK - Ready to Initialise the map! :)

	globalMapObject = L.map('mapid').setView([-33.918, 151.23], 17);
	globalCurrentTiles.addTo(globalMapObject);

	$.get("ufo/ufo-sightings.csv", function(ufoCSVString) {
		var ufoArray = Papa.parse(ufoCSVString);
		
		console.log(ufoArray);

		for (var i = 1; i < ufoArray.data.length; i++) {
			// generate dictionary
			var thisUNSWFeature = ufoArray.data[i][0];
			var thisFeatureUFOSightings = ufoArray.data[i][1];
			globalUFODictionary[thisUNSWFeature] = parseInt(thisFeatureUFOSightings);

			// update min and max
			if (!globalMinUFOSightings) globalMinUFOSightings = thisFeatureUFOSightings;
			if (!globalMaxUFOSightings) globalMaxUFOSightings = thisFeatureUFOSightings;
			if (thisFeatureUFOSightings < globalMinUFOSightings) globalMinUFOSightings = thisFeatureUFOSightings;
			if (thisFeatureUFOSightings > globalMaxUFOSightings) globalMaxUFOSightings = thisFeatureUFOSightings;
		}

		console.log(globalUFODictionary);

		itemsToAdd.forEach(function(item) {
			$.get(item, function(incomingGeoJSONString) {
				var featureGeoJSON = JSON.parse(incomingGeoJSONString);
				var thisId = featureGeoJSON["features"][0]["properties"]["ID"];
				var thisName = featureGeoJSON["features"][0]["properties"]["name"];

				var thisUFOSightings = globalUFODictionary[thisId];
				var thisFeatureUFOSightingsRelativePosition = ColourHelper.valueToPercentile(
					globalMinUFOSightings
					, globalMaxUFOSightings
					, thisUFOSightings
				);

				featureGeoJSON["features"][0]["properties"]["ufoSightings"] = thisUFOSightings;

				var thisStyle = {
					"color": ColourHelper.colourGradientHTMLString3(
						weakEndRGB, midwayRGB, strongEndRGB, thisFeatureUFOSightingsRelativePosition
					)
				};

				MapHelper.processAddedUNSWFeature(featureGeoJSON, thisStyle);
				NavbarHelper.addItemToSelector(thisId, thisName);
			});
		});
	});

	// Example: lines

	var tripStyle = {
		"color": "red"
		, "weight": 3
		, "opacity": 0.5
		, "dashArray": "5"
	};

	$.get("buildings/example-journey.geojson", function(incomingGeoJSONString) {
		var incomingGeoJSON = JSON.parse(incomingGeoJSONString);
		MapHelper.processAddedUNSWFeature(incomingGeoJSON, tripStyle);
	});


	// Example: marker

	L.marker([-33.91940969012724, 151.22611999511716]).addTo(globalMapObject)
		.bindPopup('I parked here').openPopup();

	// Done!
}