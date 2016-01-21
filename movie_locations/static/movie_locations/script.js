function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: {lat: -34.397, lng: 150.644}
  });
  var geocoder = new google.maps.Geocoder();

  document.getElementById('submit').addEventListener('click', function() {
    var title = document.getElementById('search_text').value;
    var api_url = 'https://data.sfgov.org/resource/wwmu-gmzc.json?title=' + title;
    $.get(api_url, function(data, status) {
      console.log(status);
      // TODO: check if data is empty and status is 200 => movie does not exist
      var i;
      for (i = 0; i < data.length; i++) {
        var address = data[i]['locations'] + ', San Francisco';
        setTimeout(geocodeAddress(geocoder, map, address), 10000*i);;
      }
    });
  });

  populateAutocomplete();
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

function geocodeAddress(geocoder, resultsMap, address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        animation: google.maps.Animation.DROP,
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
