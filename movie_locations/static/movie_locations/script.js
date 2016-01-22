var map;
var markers = new Array();
var movies_count = 0;
var titles = [];
var bounds;
var infowindows = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {lat: 37.769, lng: -122.446},
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
  // searchListener('Star Trek IV: The Voyage Home');
  // searchListener('Basic Instinct');
  // searchListener('Ant-Man');
}

function searchListener (title) {
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
      var base_url = 'https://image.tmdb.org/t/p/w92'; // TODO: caching?
      pic_url = base_url + poster_path;
      if (!poster_path) pic_url = default_image;
    } else {
      pic_url = default_image;
    }

    if (!data1[0][0]) {
      // Title exists, but locations not found
      messageBox(title, true);
    } else if (!messageBox (title, data1[0][0]['locations'])) {
      
      var i;
      for (i = 0; i < data1[0].length; i++) {
        var address = data1[0][i]['locations'] + ', San Francisco';
        geocodeAndMarkAddress(title, address, pic_url); //TODO: animate
      }

      // var i = 0;
      // function myLoop () {
      //   setTimeout(function () {
      //     var address = data1[0][i]['locations'] + ', San Francisco';
      //     geocodeAndMarkAddress(title, address, pic_url); //TODO: animate
      //     i++;
      //     if (i < data1[0].length) {
      //       myLoop();
      //     }
      //   }, 300)
      // }
      // myLoop();


      var html = '<li id="' + getElemId(title) + '" > <a href="#" onclick="selectMovie (\'' + title.replace('\'', '\\\'') + '\');" ><img id="' + getElemId(title) + '_image" class="blue_border" src="' + pic_url + '" alt="' + title + '" /> <a href="#" onclick="deleteMovie (\'' + title.replace('\'', '\\\'') + '\');" class="delete"><i class="fa fa-times-circle"></i></a> </a></li>';
      $('.movie_list').append(html)
      movies_count += 1;
      $('.movie_list').width(movies_count * 115);
      // TODO: scrolling $('#selected_movies').scrollLeft = movies_count * 110;
      selectMovie(title);
      $('#search_text').val('');
    }
  }); // TODO: done() error handling?
}

function bounceMarkers (title) {
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

function deleteMovie (title) {
  deleteMarkers(title);
  $('#' + getElemId(title)).remove();
  movies_count -= 1;
  $('.movie_list').width(movies_count * 115);

}

function deleteMarkers (title) {
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
    map.setZoom (12);
    map.setCenter ({lat: 37.769, lng: -122.446});
  }
  else { 
    customFitBounds();
  }
}

function populateAutocomplete () {
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
    searchListener('Godzilla'); //TODO: remove
    searchListener('Star Trek IV: The Voyage Home');
  });
}

function messageBox (title, locations) {
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

function geocodeAndMarkAddress(title, address, pic_url) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      // map.setCenter(results[0].geometry.location);
      map.panTo(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: map,
        // animation: google.maps.Animation.BOUNCE,
        position: results[0].geometry.location,
      });

      setTimeout(function() {
        marker.setAnimation(null); // this stops the bouncing
      }, 700);

      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');

      var contentString = '<strong>' + address + '</strong><br/>' + title;
      var infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 250
      });
      infowindows.push(infowindow);
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
    } else {
      console.log('Geocode was not successful because: ' + status);
    }
  });
}

function selectMovie (title) {
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

function getElemId (title) {
  return 'selected_' + title.replace(/[^\w]/gi, '');
}

function getBoundsObject (locations) {
  var bounds = new google.maps.LatLngBounds();
  var i;
  for (i = 0; i < locations.length; i++) {
    bounds.extend(locations[i].position);
  }
  return bounds;
}

function addToBounds (marker) {
  bounds.extend(marker.position);
  return bounds;
}

function closeInfoWindows () {
  var i; 
  for (i = 0; i < infowindows.length; i++) {
    infowindows[i].close();
  }
}

function customFitBounds () {
  map.fitBounds(bounds);
  var zoom = map.getZoom();
  map.setZoom(zoom > 13 ? 13 : zoom);
}