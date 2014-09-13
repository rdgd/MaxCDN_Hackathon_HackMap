<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>MaxCDN MapHack</title>
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src='https://api.tiles.mapbox.com/mapbox.js/v2.1.0/mapbox.js'></script>
	<script src='https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/leaflet.markercluster.js'></script>
	<script src='/third_party/leaflet-awesome-markers/leaflet.awesome-markers.js'></script>	
	<script src='https://api.tiles.mapbox.com/mapbox.js/plugins/arc.js/v0.1.0/arc.js'></script>

	<link href='https://api.tiles.mapbox.com/mapbox.js/v2.1.0/mapbox.css' rel='stylesheet' />
	<link href='/third_party/leaflet-awesome-markers/leaflet.awesome-markers.css' rel='stylesheet' />
	<link href='https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.css' rel='stylesheet' />
	<link href='https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.Default.css' rel='stylesheet' />
	<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
	<link href="/assets/css/main.css" rel="stylesheet" />
</head>
<body>
	<div id="preloader">
		<div>
			<h1>MapHack</h1>
			<img src="/assets/img/LoadingGif.gif" alt="loading..." />
		</div>
	</div>
	<div id="header">
		<h1>MapHack</h1>
	</div>
	<div id="map"></div>
</body>
	<script src="/assets/js/pop_maps.js"></script>
	<script src="/assets/js/map.js"></script>
</html>