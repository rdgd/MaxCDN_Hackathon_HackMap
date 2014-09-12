(function(){
  function UsageMap(){
    this.elements = {};
    this._requestLines = [];

    L.mapbox.accessToken = 'pk.eyJ1IjoicnlhbmRncmF5IiwiYSI6IlF5RWtSUEEifQ.8Ma9X7rQULgNbUmqyjlF3g';
    this._map = L.mapbox.map('map', {});
    this._map.addLayer(L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'))
    this._map.setView([41.8819, -87.6278], 3);
    this._map._layersMinZoom = 3;
    this.get_data();
    this.make_legend();
    this.make_about();
    this.make_filters();
    this.set_hooks();
    this.pop_maps = {
     'lax':{
        loc:"Los Angeles",
        coordinate: { latitude: 33.926077,longitude:-118.394123},
        color:'blue',
        region:'US'
     },
     'sea':{
         loc:"Seattle",
         coordinate: { latitude: 47.494136,longitude:-122.2944099},
         color:'red',
        fillKey: 'pop',
        region:'US'
       },
     'jfk':{
        loc:"New York",
        coordinate:{ latitude: 40.7200972,longitude:-74.0046293},
        color:'green',
        fillKey: 'pop',
        region:'US'
     },
     'atl':{
       loc:"Atlanta",
       coordinate:{ latitude:33.7545152,longitude:-84.3901396 },
       color:'orange',
        fillKey: 'pop',
        region:'US'
     },
     'ams':{
       loc:"Amsterdam",
       coordinate:{ latitude:52.3365239,longitude:4.9318931 },
       color:'purple',
        fillKey: 'pop',
        region:'EU'
     },
     'dal':{
       loc:"Dallas",
       coordinate:{ latitude:32.8206645,longitude: -96.7313396 },
       color:'purple',
        fillKey: 'pop',
        region:'US'
     },
     'chi':{
       loc:"Chicago",
       coordinate:{ latitude:41.8337329,longitude:-87.7321555 },
       color:'deeppink',
        fillKey: 'pop',
        region:'US'
     },
     'vir':{
       loc:"Ashburn, VA",
       coordinate:{ latitude:39.0156917,longitude:-77.4583847 },
       color:'yellow',
        fillKey: 'pop',
        region:'US'
     },
     'lhr':{
       loc:"London",
       coordinate:{ latitude:51.4997434,longitude:-0.0107621 },
       color:'orange',
        fillKey: 'pop',
        region:'EU'
     },
     'sfo':{
       loc:"San Francisco",
       coordinate:{ latitude:37.616418,longitude:-122.4204358 },
       color:'orange',
        fillKey: 'pop',
        region:'US'
     },
     'fra':{
       loc:"Frankfurt",
       coordinate:{ latitude:50.1171769,longitude:8.7234794 },
       color:'purple',
        fillKey: 'pop',
        region:'EU'
     }
   };

  }

  UsageMap.prototype.set_hooks = function(){
    var els = this.elements;
    els.legend.on('click', $.proxy(this.toggle_legend, this));
    els.about.on('click', $.proxy(this.toggle_about, this));
    els.filters.on('click', $.proxy(this.toggle_request_web, this));
  };

  UsageMap.prototype.get_data = function(){
    $.ajax({
      url: "/index.php/api/get_data",
      success: $.proxy(this.handle_response, this)
    });
  };

  UsageMap.prototype.handle_response = function(data){
    var parsed = this.parse_response(data);
    this.plot_markers(parsed.mapData);
    this.update_charts(parsed.chartData);
  };

  UsageMap.prototype.plot_markers = function(data){
    var markers = new L.MarkerClusterGroup();
    markers.options.showCoverageOnHover = false;
    markers.options.iconCreateFunction =  function (cluster) {
      var childCount = cluster.getChildCount();
      var c = ' marker-cluster-medium';
      return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
    };

    var versionCounts = {};
    var totalRequests = data.length;

    for(var i = 0; i < data.length; i++){
      var color = "blue";

      switch(data[i].library){
        case 'jquery':
          color = 'blue';
        break;
        case 'mobile': 
          color = 'green';
        break;
        case 'ui':
          color = 'orange';
        break;
        case 'migrate':
          color = 'cadetblue';
        break;
        default: 
          color = 'red';
        break;
      }
       // Creates a red marker with the coffee icon
      var customMarker = L.AwesomeMarkers.icon({
        markerColor: color
      });

      var marker = L.marker(data[i].request.latLng, {icon: customMarker});
      marker.on('popupopen', $.proxy(this.get_street_address, this))

      //need to add minified indication
      var content = "<div>Library: " + data[i].library + " </div><div> Version: " + data[i].version + "</div><div>Referer: <a href='" + data[i].request.referer + "' target='_blank' >" + data[i].request.referer + " </a></div><div>Address: <span  class='street-address'></span></div>";
      marker.bindPopup(content);
      markers.addLayer(marker);
    }

    this._map.addLayer(markers);
    this.show_map();
  },

  UsageMap.prototype.get_street_address = function(e){
    var coords = e.popup.getLatLng();
    var streetAddress = $(e.popup._contentNode).find('.street-address');
    $.ajax({
      url: '/index.php/api/reverse_geocode/' + coords.lat + '/' + coords.lng,
      success: function(response){
        var address;
        if(response.hasOwnProperty('error')){
          address = response.error;
        } else {
          address = response.freeformAddress;
        }
        streetAddress.text(address);
      } 
    });
  };

  UsageMap.prototype.parse_response = function(response){
    var parsed = [];
    var versionCounts = {};
    var totalRequests = response.length;
    var requestPopPairs = [];

    for(var i = 0; i < response.length; i++){
      if(!response[i].hasOwnProperty('uri') || response[i].uri.indexOf('.js') == -1){ continue; }

      var version = response[i].uri;

      var flag = false;
      if(version.indexOf('rc') > -1){ flag = true; }
      var minified = version.indexOf('.min') > -1;
      version = version.substring(1).split('/');
      
      if(version.length === 1 && version[0].indexOf('jquery') === 0){
        if(version[0].indexOf('migrate') > 0){
          version = ['migrate', version[0].split('-')[2]];
        } else if(version[0].indexOf('latest') > 0){
          version = ['jquery', 'latest'];
        } else {
          version = version[0].split('-');
          if(version[0].indexOf('.') > -1){
            version[0] = version[0].split('.')[0];
          }
        }
      }

      if(!flag){ 
        if(version.length === 2){
          var release = version[1].split('.');
          if(release.length === 1){ 
            version[1] = release[0]; 
          } else {
            version[1] = [release[0], release[1], release[2]].join('.');
          }
        }
      }

      version[2] = minified;

      version = {
        library: version[0],
        version: version[1] || '',
        minified: version[2],
        request: {
          latLng: [response[i].client_latitude, response[i].client_longitude],
          referer: response[i].referer,
          address: response[i].address
        }
      };

      var pop = this.pop_maps[response[i].pop];
      requestPopPairs.push([[pop.coordinate.latitude, pop.coordinate.longitude], version.request.latLng]);
      parsed.push(version);

      var label = version.minified ? version.library + " " + version.version + " minified" : version.library + " " + version.version;
      if(versionCounts.hasOwnProperty(label)){
        versionCounts[label]++
      } else {
        versionCounts[label] = 1;
      }
    }

    this.requestPopPairs = requestPopPairs;
    return { mapData: parsed, chartData: versionCounts };
  };

  UsageMap.prototype.show_map = function(){
    $('#preloader').fadeOut();

  };

  UsageMap.prototype.update_charts = function(data){

  };

  UsageMap.prototype.make_legend = function(data, totalRequests){
    var legend = $("<div id='legend'></div>");
    var legendTitle = $("<div class='legend-header'><i class='fa fa-arrow-circle-o-down'></i><strong>Legend</strong></div>").appendTo(legend);
    var legendBody = $("<nav class='legend clearfix legend-nav'></nav>").appendTo(legend);
    var blueMarker = $('<div><div class="awesome-marker-icon-blue awesome-marker" tabindex="0" style="width: 35px; height: 45px; position:relative;"><i class=" glyphicon glyphicon-coffee  icon-white"></i></div><span class="legend-label">JQuery</span></div>').appendTo(legendBody);
    var cadetBlueMarker = $('<div><div class="awesome-marker-icon-cadetblue awesome-marker" tabindex="0" style="width: 35px; height: 45px; position:relative;"><i class=" glyphicon glyphicon-coffee  icon-white"></i></div><span class="legend-label">JQuery Migrate</span></div>').appendTo(legendBody);
    var orangeMarker = $('<div><div class="awesome-marker-icon-orange awesome-marker" tabindex="0" style="width: 35px; height: 45px; position:relative;"><i class=" glyphicon glyphicon-coffee  icon-white"></i></div><span class="legend-label">JQuery UI</span></div>').appendTo(legendBody);
    var greenMarker = $('<div><div class="awesome-marker-icon-green awesome-marker" tabindex="0" style="width: 35px; height: 45px; position:relative;"><i class=" glyphicon glyphicon-coffee  icon-white"></i></div><span class="legend-label">JQuery Mobile</span></div>').appendTo(legendBody);
    var redMarker = $('<div><div class="awesome-marker-icon-red awesome-marker" tabindex="0" style="width: 35px; height: 45px; position:relative;"><i class=" glyphicon glyphicon-coffee  icon-white"></i></div><span class="legend-label">Other</span></div>').appendTo(legendBody);

    this.legend = this._map.legendControl.addLegend(legend[0].outerHTML);
    this.elements.legend = $("#legend");
    this.elements.legend_header = $('.legend-header');
  };

  UsageMap.prototype.make_about = function(){
    var about = $("<div id='about' class='map-legends wax-legends leaflet-control'></div>");
    var aboutInner = $('<div class="map-legend wax-legend"></div>');
    var aboutTitle = $("<div class='about-header'><i class='fa fa-arrow-circle-o-down'></i><strong>About</strong></div>").appendTo(aboutInner);
    var aboutBody = $("<div class='about-body'>This map shows only sucessful requests (response code 200) for files with extension '.js'. Clicking on the marker icon in the bottom right hand corner gives you a legend. Clicking the web icon in the upper right will draw arcs which indicates what PoP served who.</div>").appendTo(aboutInner);
    about.append(aboutInner);
    $('.leaflet-bottom.leaflet-left').append(about);

    this.elements.about = $('#about');
    this.elements.about_header = $('#about-header');
  };

  UsageMap.prototype.make_filters = function(){
    var about = $("<div id='filters' class='map-legends wax-legends leaflet-control'></div>");
    var aboutInner = $('<div class="map-legend wax-legend"></div>');
    var aboutTitle = $("<div><img id='web-button' src='/assets/img/spiderweb.png' alt='Watch it happen.'' /></div>").appendTo(aboutInner);
    
    about.append(aboutInner);
    $('.leaflet-top.leaflet-right').append(about);

    this.elements.filters = $('#web-button');
    this.elements.filters_header = $('.filters-header');
  };

  UsageMap.prototype.toggle_legend = function(e){
    $(e.currentTarget).closest('.map-legends').toggleClass('legend-hidden');
    this.elements.legend_header.find('i').toggleClass('fa-arrow-circle-o-down fa-map-marker'); 
  };

  UsageMap.prototype.toggle_about = function(e){
    $(e.currentTarget).toggleClass('legend-hidden');
    $(e.currentTarget).find('i').toggleClass('fa-arrow-circle-o-down fa-question-circle'); 
  };

  UsageMap.prototype.toggle_filters = function(e){
    $(e.currentTarget).toggleClass('legend-hidden');
    $(e.currentTarget).find('i').toggleClass('fa-arrow-circle-o-right fa-filter'); 
  };

  UsageMap.prototype.toggle_request_web = function(e){
    if($(e.currentTarget).closest('.map-legend').hasClass('active')){
      this.destroy_activity_drawing();
    } else {
      this.draw_activity(this.requestPopPairs);
    }
    $(e.currentTarget).closest('.map-legend').toggleClass('active');
  };

  UsageMap.prototype.destroy_activity_drawing = function(){
    for(line in this._requestLines){
      this._map.removeLayer(this._requestLines[line]);
    }
  };

  UsageMap.prototype.draw_activity = function(pairs){
    function obj(ll) { return { y: ll[0], x: ll[1] }; }

    for(var i = 0; i < pairs.length; i++) {
      var generator = new arc.GreatCircle(
              obj(pairs[i][0]),
              obj(pairs[i][1]));
      var line = generator.Arc(100, { offset: 10 });
      var newLine = L.polyline(line.geometries[0].coords.map(function(c) {
          return c.reverse();
      }), {
          color: '#fff',
          weight: 1,
          opacity: 0.5
      });

      this._requestLines.push(newLine);
      newLine.addTo(this._map);

      var totalLength = newLine._path.getTotalLength();
      newLine._path.classList.add('path-start');
      newLine._path.style.strokeDashoffset = totalLength;
      newLine._path.style.strokeDasharray = totalLength;
      setTimeout((function(path) {
          return function() {
              path.style.strokeDashoffset = 0;
          };
      })(newLine._path), i * 100);
      }
    };

  new UsageMap();

})();
