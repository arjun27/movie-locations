var map;
var markers = new Array();

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {lat: 37.769, lng: -122.446}
  });

  document.getElementById('submit').addEventListener('click', searchListener);

  populateAutocomplete();
}

function searchListener () {
  var title = document.getElementById('search_text').value;
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
      var base_url = 'http://image.tmdb.org/t/p/w92';
      pic_url = base_url + poster_path;
      console.log(pic_url);
    } else {
      pic_url = ''; // TODO: no poster found picture
    }

    console.log(data1);

    var i;
    for (i = 0; i < data1[0].length; i++) {
      var address = data1[0][i]['locations'] + ', San Francisco';
      setTimeout(geocodeAndMarkAddress(title, address, pic_url), 10000*i); //TODO: animate
    }
    var elem_id = 'selected_' + title.replace(new RegExp(' ', 'g'), '').replace(new RegExp(':', 'g'), '');
    var html = '<a id="' + elem_id + '" href="#" onclick="deleteSelectedMovie(\'' + elem_id + '\');">' + title + '</a>';
    console.log(html);
    $('#selected_movies').append(html);
  }); // TODO: done() error handling?
}

function deleteSelectedMovie (id) {
  console.log('deleting', id);
  var elem = $('#' + id);
  var title = elem.text();
  deleteMarkers (title);
  elem.remove();
}

function deleteMarkers (title) {
  if (title in markers) {
    var len = markers[title].length;
    var i;
    for (i = 0; i < len; i++) {
      markers[title][i].setMap(null);
    }
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
        position: results[0].geometry.location
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
