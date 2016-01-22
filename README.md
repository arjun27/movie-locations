# SF Movie Locations

## Problem statement
Show movie locations on a map of San Francisco. The user should be able to filter the view using autocomplete search. 

Data has been sourced from [SF OpenData](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am)

## Solution
#### Deployment location
The solution has been deployed on [heroku](https://movie-locations.herokuapp.com/). The app maps movie locations, and search by movie titles is assisted with an autocomplete feature.

#### Functional choices
* The dataset has 1241 locations for 273 movies. To display all the information would be meaningless to the user. Therefore, the app has been designed so that it is easy for a user to observe movie locations of selected movies.
* The user can search for movie names, and search has been assisted by autocomplete.
* A horizontal scroll carousel for movie posters to manage multiple movies and highlight specific locations has been provided at the bottom.
* In addition to desktop screens, the app is well suited to small mobile screens to be used on-the-go.

#### Technical choices
* __Trade offs__
  The app uses Google Maps API (for map display) and The Movie Database API (for movie posters). Both these APIs have usage limits which are defined per IP address. Therefore, the app is designed to keep computation on the client side only.

  The free usage tier of Google Maps API restrict calls to 10 entries per second. While it is possible to overcome this by introducing delays in API calls, it has been disabled as it affected the UX. Caching could not be implemented do to time constraints. 
* __Back end__
  The app uses Django as the web framework, with Gunicorn as the production server. Whitenoise is used to serve static files.

  Automated testing: a basic test case to check response of root URL has been added.
* __Front end__
  The app uses Jquery

  font awesome

#### Future possible work
* Geolocalize the user to assist location
* Add street view to show the user what the location actually looks like
* Location bookmarking: authenticate and store on server
* Search by location and actor

## Other code
* Named data networking: I worked with on future Internet architecture at the Internet Research Lab, UCLA, to add bluetooth physical layer compatibility to the stack. Code for [unix](https://github.com/arjun27/NDNBlue-BlueZ) (mostly C) and [android](https://github.com/arjun27/NDNBlue-BlueZ) (Android SDK)
* Leetcode solutions: 100+ Leetcode.com problems solved [link](https://github.com/arjun27/LeetCode) (C++ STL)

## Public profiles
* Linkedin [link](https://in.linkedin.com/in/arjun-attam-ba73a826)
* Twitter [link](https://twitter.com/arjunattam)

## Hosted application link
[movie-locations.herokuapp.com](https://movie-locations.herokuapp.com/)