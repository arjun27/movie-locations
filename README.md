# SF Movie Locations

## Problem statement
Show movie locations on a map of San Francisco. The user should be able to filter the view using autocomplete search. 

Movie locations data for SF is available at [OpenData](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am)

## Solution
#### Solution summary
The solution has been deployed on [heroku](https://movie-locations.herokuapp.com/). The app maps movie locations, and search for movie titles is assisted with an autocomplete feature.

The code calls the SF OpenData API for movie locations and The Movie Database API for movie posters. Movie locations are plotted on a map, made with the Google Maps API. The UX/UI is meant to help the user manage multiple movies and their locations, on desktop and mobile screen sizes and browsers.

#### Functional choices
* The dataset has 1241 locations for 273 movies. To display all the information would be meaningless to the user. Therefore, the app has been designed so that it is easy for a user to observe movie locations of selected movies.
* The user can search for movie names, and search has been assisted by autocomplete.
* A horizontal scroll carousel for movie posters - to easily manage multiple movies and highlight specific locations - has been provided at the bottom.
* In addition to desktop screens, the app is well suited to small mobile screens, to be used on-the-go.

#### Technical choices
* __Trade offs__

  The app uses Google Maps API (for map display) and The Movie Database API (for movie posters). Both these APIs have usage limits which are defined per IP address. Therefore, the app is designed to keep computation on the client side only.

  The free tier of Google Maps API restricts usage to 10 calls per second. While it is possible to overcome this by introducing delays in API calls, it has been disabled as it affected the UX. Caching could not be implemented due to time constraints. 
* __Back end__

  The app uses Django as the web framework, with Gunicorn as the production server. Whitenoise is used to serve static files. The app is hosted on a free web dyno on Heroku. Django was chosen because it fulfills the app requirements, is easy to maintain and deploy on Heroku.

  The app is front-end heavy, and most of the Python code is Django boilerplate. In Python, I wrote the URL definitions, code to serve static files, and automated testing.

  __Automated testing__: a basic test case to check response of root URL has been added.
* __Front end__

  I wrote the front-end HTML, CSS and JS. API calls were made to SF OpenData (for movie locations data), Google Maps (map operations) and The Movie Database (movie poster data) wherever required. Jquery was used for two reasons: autocomplete and handling asynchronous methods.

  __Autocomplete__: The app search uses the Jquery [widget](https://jqueryui.com/autocomplete/) to implement autocomplete. The elements of the widget were styled in CSS to suit the app UI.

  __Asynchronous methods__: The app has multiple instances where parallel asynchronous method are launched, that require common callback functions to give a smooth UX. These instances occur when movie titles are searched and when multiple movie locations are geocoded. The Jquery Deferred utility object was used to run the appropriate callbacks. (_I enjoyed learning how to build this the most._)

  The app also uses Font Awesome [icons](http://fortawesome.github.io/Font-Awesome/) for the delete symbol in the movie posters carousel.

#### Hosted application link
[movie-locations.herokuapp.com](https://movie-locations.herokuapp.com/)

#### Future possible work
* Geolocalize the user to assist location
* Add street view to show the user what the location actually looks like
* Search by location and actor
* Location bookmarking: authenticate and store on server
* Relevant automated tests

## Other code
* Named data networking: I worked on [NDN](http://named-data.net/), a future Internet architecture, to add Bluetooth physical layer compatibility to the networking stack. Code for [unix](https://github.com/arjun27/NDNBlue-BlueZ) (mostly C) and [android](https://github.com/arjun27/NDNBlue-BlueZ) (Android SDK)
* Leetcode solutions: 100+ Leetcode.com problems solved [link](https://github.com/arjun27/LeetCode) (C++ STL)

## Public profiles
* Linkedin [link](https://in.linkedin.com/in/arjun-attam-ba73a826)
* Twitter [link](https://twitter.com/arjunattam)