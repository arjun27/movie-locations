/*
  Global variable definitions
*/
var map;
var markers = new Array();
var movies_count = 0;
var titles = [];
var bounds;
var infowindows = [];
var imgWidth, defaultZoom;
var sfCenter = {lat: 37.769, lng: -122.446};

/*
  Map methods
*/
function initMap() {
  // method to initialise the map and define constants
  defaultZoom = $(window).width() < 500 ? 11 : 12;
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: defaultZoom,
    center: sfCenter,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
  });

  document.getElementById('submit').addEventListener('click', function() { 
    var title = document.getElementById('search_text').value;
    searchListener (title);
  });

  document.getElementById('search_text').addEventListener('click', function() {
    $('#search_text').val('');
    $('#message_bar').hide();
  });

  populateAutocomplete();
  bounds = new google.maps.LatLngBounds();
  imgWidth = $(window).width() < 500 ? 80 : 115;
}

/*
  Search methods
*/
function searchListener (title) {
  // main search method
  if (title == '') {
    messageBox(title, null);
    return;
  }
  var api_url = 'https://data.sfgov.org/resource/wwmu-gmzc.json?title=' + title;
  var pic_api_url = 'https://api.themoviedb.org/3/search/movie?api_key=5b2d8059a779795a80fdb7e4088315ad&query=' + title;
  var get1 = $.get(api_url);
  var get2 = $.get(pic_api_url);

  $.when(get1, get2).done(function(data1, data2) {
    var pic_url = '';
    if (data2[0]['results'].length > 0) {
      var poster_path = data2[0]['results'][0]['poster_path'];
      var base_url = 'https://image.tmdb.org/t/p/w92';
      pic_url = base_url + poster_path;
      if (!poster_path) pic_url = default_image;
    } else {
      pic_url = default_image;
    }

    if (!data1[0][0]) {
      // title exists, but locations not found
      messageBox(title, true);
    } else if (!messageBox (title, data1[0][0]['locations'])) {
      
      // code to bypass geocode limit by delaying calls
      // var i = 0;
      // function myLoop () {
      //   setTimeout(function () {
      //     var address = data1[0][i]['locations'] + ', San Francisco';
      //     geocodeAndMarkAddress(title, address, pic_url); //TODO: animate
      //     i++;
      //     if (i < data1[0].length) {
      //       myLoop();
      //     }
      //   }, 200)
      // }
      // myLoop();

      // get geocodes
      var geocoder = new google.maps.Geocoder();
      var i; var addresses = [];
      for (i = 0; i < data1[0].length; i++) {
        addresses.push ( data1[0][i]['locations'] + ', San Francisco' );
      }
      var deferreds = getGeocodeAddressDeferred(geocoder, addresses);
      var markersData = [];
      $.when.apply($, deferreds).done(function (locations) {
        $.each(arguments, function (i, data) {
          if (data) markersData.push(data);
        });
        // put markers
        var i;
        for (i = 0; i < markersData.length; i++) {
          createMarker(markersData[i]['address'], title, markersData[i]['location']);
        }
        selectMovie(title);
      });

      // put movie image in movie list
      var html = '<li id="' + getElemId(title) + '" > <a href="#" onclick="selectMovie (\'' + title.replace('\'', '\\\'') + '\');" ><img id="' + getElemId(title) + '_image" class="blue_border" src="' + pic_url + '" alt="' + title + '" /> <a href="#" onclick="deleteMovie (\'' + title.replace('\'', '\\\'') + '\');" class="delete"><i class="fa fa-times-circle"></i></a> </a></li>';
      $('.movie_list').append(html)
      movies_count += 1;
      $('.movie_list').width(movies_count * imgWidth);

      // reset search field
      $('#search_text').val('');
    }
  });
}

function messageBox (title, locations) {
  // method to handle errors in search text input
  var error = false;
  var msg = '';
  if (title == '') {
    error = true;
    msg = 'Please enter a movie title';
  } else if (!locations) {
    error = true;
    msg = '<strong>' + title + '</strong> was shot in SF, but we don\'t have location data.';
  } else {
    if (titles.indexOf(title) >= 0) {
      if (title in markers) {
        error = true;
        msg = '<strong>' + title + '</strong> has already been selected.';
        selectMovie(title);
      } 
    } else {
      error = true;
      msg = 'Sorry, <strong>' + title + '</strong> was not shot in SF.';
    }
  }
  if (error) {
    $('#message_bar').html(msg);
    $('#message_bar').show();
  } else {
    $('#message_bar').hide();
  }
  return error;
}

function populateAutocomplete () {
  // method to populate autocomplete search
  var api_url = 'https://data.sfgov.org/resource/wwmu-gmzc.json?$select=title&$group=title';
  $.get(api_url, function(data, status) {
    var i;
    for (i = 0; i < data.length; i++) {
      titles.push(data[i]['title']);
    }
    $("#search_text").autocomplete( {
      source: titles,
      open: function(event, ui) {
        $('.ui-autocomplete').off('menufocus hover mouseover');
      },
      autoFocus: true
    });
    $("#search_text").keydown(function(event) {
      if(event.keyCode == 13) {
        if($("#search_text").val().length==0) {
          event.preventDefault();
          return false;
        } else {
          searchListener($("#search_text").val());
        }
      }
    });

    // state zero carousel
    // searchListener('Basic Instinct');
    searchListener('Star Trek II : The Wrath of Khan');
    searchListener('The Times of Harvey Milk');
    searchListener('Star Trek VI: The Undiscovered Country');
    searchListener('Alexander\'s Ragtime Band');
    searchListener('Crackers');
    searchListener('High Anxiety');
  });
}

/*
  Marker methods
*/
function createMarker (address, title, location) {
  // method to create marker and infowindow
  var marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP,
    position: location
  });
  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
  var contentString = '<strong>' + address + '</strong><br/>' + title;
  var infowindow = new google.maps.InfoWindow({
    content: contentString,
    maxWidth: 250
  });
  console.log('content', contentString);
  infowindows.push(infowindow);
  console.log('marker', marker.position.toString());
  marker.addListener('click', function() {
    closeInfoWindows();
    infowindow.open(map, marker);
  });

  if (title in markers) {
    markers[title].push(marker);
  } else {
    markers[title] = [marker];
  }
  addToBounds(marker);
  customFitBounds();
}

function bounceMarkers (title) {
  // method to animate markers for selected movie
  if (title in markers) {
    var len = markers[title].length;
    var i;
    for (i = 0; i < len; i++) {
      var marker = markers[title][i];
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    setTimeout(function() {
      for (i = 0; i < len; i++) {
        var marker = markers[title][i];
        marker.setAnimation(null);
      }
    }, 700);
  }
}

function deleteMarkers (title) {
  // method to delete markers of movie to be deleted
  if (title in markers) {
    var len = markers[title].length;
    var i;
    for (i = 0; i < len; i++) {
      markers[title][i].setMap(null);
    }
    delete markers[title];
  }
  var new_bounds = new google.maps.LatLngBounds();
  for (var key in markers) {
    var i;
    for (i = 0; i < markers[key].length; i++) {
      new_bounds.extend(markers[key][i].position);
    }
  }
  bounds = new_bounds;
  if (bounds.isEmpty()) {
    map.setZoom (defaultZoom);
    map.setCenter (sfCenter);
  }
  else { 
    customFitBounds();
  }
}

/*
  Geocoding methods
*/
function getGeocodeAddressDeferred(geocoder, addresses) {
  // method to handle multiple async calls to google maps
  var deferreds = [];
  $.each(addresses, function (i,address) {
    deferreds.push(geocodeAddress(geocoder, address));
  });
  return deferreds;
}

function geocodeAddress(geocoder, address) {
  // method to fetch geocode for location from google maps
  var deferred = $.Deferred();
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var data = { 'address': address, 'location': results[0].geometry.location};
      deferred.resolve(data);
    } else {
      console.log('Geocode was not successful because: ' + status);
      deferred.resolve(null);
    } 
  });
  return deferred.promise();
}

/*
  Movie operation methods
*/
function deleteMovie (title) {
  // method to delete movie from selection
  deleteMarkers(title);
  $('#' + getElemId(title)).remove();
  movies_count -= 1;
  $('.movie_list').width(movies_count * imgWidth);
}

function selectMovie (title) {
  // method to select movie and its markers
  for (var key in markers) {
    if (key == title) {
      var i;
      for (i = 0; i < markers[key].length; i++) {
        markers[key][i].setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
      }
      $('#' + getElemId(key) + '_image').removeClass('red_border').addClass('blue_border');
    } else {
      var i;
      for (i = 0; i < markers[key].length; i++) {
        markers[key][i].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      }
      $('#' + getElemId(key) + '_image').removeClass('blue_border').addClass('red_border');
    }
  }
  bounceMarkers(title);
}

/*
  Map bounds methods
*/
function addToBounds (marker) {
  // method to add locations map display bounds
  bounds.extend(marker.position);
  return bounds;
}

function customFitBounds () {
  // method to move map to new bounds
  map.fitBounds(bounds);
  var zoom = map.getZoom();
  map.setZoom(zoom > 13 ? 13 : zoom);
}

/*
  Infowindow methods
*/
function closeInfoWindows () {
  // method to close all infowindows
  var i; 
  for (i = 0; i < infowindows.length; i++) {
    infowindows[i].close();
  }
}

/*
  Utility methods
*/
function getElemId (title) {
  // method to get element id for a selected movie
  return 'selected_' + title.replace(/[^\w]/gi, '');
}
