var map;
var markers = new Array();
var movies_count = 0;
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {lat: 37.769, lng: -122.446}
  });

  document.getElementById('submit').addEventListener('click', function() { 
    var title = document.getElementById('search_text').value;
    searchListener (title);
  });

  populateAutocomplete();

  // searchListener('Star Trek IV: The Voyage Home');
  // searchListener('Basic Instinct');
  // searchListener('Ant-Man');
  searchListener('Godzilla');
}

function searchListener (title) {
  var api_url = 'https://data.sfgov.org/resource/wwmu-gmzc.json?title=' + title;
  var pic_api_url = 'https://api.themoviedb.org/3/search/movie?api_key=5b2d8059a779795a80fdb7e4088315ad&query=' + title;
  var get1 = $.get(api_url);
  var get2 = $.get(pic_api_url);

  $.when(get1, get2).done(function(data1, data2) {
    // TODO: check if data is empty and status is 200 => movie does not exist
    console.log(data2);
    var pic_url = '';
    if (data2[0]['results'].length > 0) {
      var poster_path = data2[0]['results'][0]['poster_path'];
      var base_url = 'https://image.tmdb.org/t/p/w92'; // TODO: caching?
      pic_url = base_url + poster_path;
      console.log(pic_url);
      if (!poster_path) pic_url = default_image;
    } else {
      pic_url = 'images/default.png';
    }

    console.log(data1);

    var i;
    for (i = 0; i < data1[0].length; i++) {
      var address = data1[0][i]['locations'] + ', San Francisco';
      setTimeout(geocodeAndMarkAddress(title, address, pic_url), 10000*i); //TODO: animate
    }
    var elem_id = 'selected_' + title.replace(new RegExp(' ', 'g'), '').replace(new RegExp(':', 'g'), '');
    // var html = '<li> <a id="' + elem_id + '" href="#" onclick="deleteSelectedMovie(\'' + elem_id + '\');">' + title + '</a> </li>';
    var html = '<li> <img src="' + pic_url + '" alt="' + title + '" onclick="bounceMarkers(\'' + title + '\');" /> </li>';
    console.log(html);
    // $('#selected_movies').append(html);
    $('.movie_list').append(html)
    movies_count += 1;
    $('.movie_list').width(movies_count * 120);
  }); // TODO: done() error handling?
}

function bounceMarkers (title) {
  if (title in markers) {
    var len = markers[title].length;
    var i;
    for (i = 0; i < len; i++) {
      var marker = markers[title][i];
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }
  }
}

function deleteSelectedMovie (id) {
  console.log('deleting', id);
  var elem = $('#' + id);
  var title = elem.text();
  deleteMarkers (title);
  elem.remove();
  movies_count -= 1;
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
}

function populateAutocomplete () {
  var api_url = 'https://data.sfgov.org/resource/wwmu-gmzc.json?$select=title&$group=title';
  var titles = [];
  $.get(api_url, function(data, status) {
    console.log(status);
    var i;
    for (i = 0; i < data.length; i++) {
      titles.push(data[i]['title']);
    }
    $("#search_text").autocomplete( {
      source: titles
    });
  });
}

function geocodeAndMarkAddress(title, address, pic_url) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: map,
        // animation: google.maps.Animation.DROP,
        position: results[0].geometry.location,
        label: labels[movies_count-1 % labels.length],
      });

      var contentString = '<img src="' + pic_url + '" />';
      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });

      if (title in markers) {
        markers[title].push(marker);
      } else {
        markers[title] = [marker];
        console.log('new', markers);
      }
    } else {
      console.log('Geocode was not successful for the following reason: ' + status);
    }
  });
}
