"use strict";

// location vars
let lat, lon;
let weatherJSON;
let windowHash = window.location.hash;

// set up some default params for if the weather lookup fails
let currentClouds = 7000;
let dayOneClouds = 6000;
let dayTwoClouds = 5000;
let dayThreeClouds = 8000;
let currentWindSpeed = 0.13;
let dayOneWindSpeed = 0.05;
let dayTwoWindSpeed = 0.07;
let dayThreeWindSpeed = 0.11;
let currentRainmm = "-24";
let currentDewPoint = 50.6;
let dayOneMaxTemp = 0
let dayTwoMaxTemp = 1
let dayThreeMaxTemp = 2 
let dayFourMaxTemp = 3
let dayOneMinTemp = 1
let dayTwoMinTemp = 2
let dayThreeMinTemp = 2
let dayFourMinTemp = 4

// create some consts for picking notes 
const notes = ["F#", "G#", "A#", "C#", "D#"]
const octaves = ["2", "3", "4", "5", "6"]

// grab the latLon from the window hash send from the landing page
let windowHashAttributes = windowHash.split("#");

// assign to the latLon object
let latLon = {
  "latitude": windowHashAttributes[1],
  "longitude": windowHashAttributes[2]
}

// Function using fetch to POST to our API endpoint
async function weatherLookup(data) {
  const response = await fetch('/.netlify/functions/weatherLookup', {
    body: JSON.stringify(data),
    method: 'POST'
  });
  return await response.json();
}

// grab the weather data from the API on mousedown
// send the lat and lon as an object to the AWS Lambada function
weatherLookup(latLon).then((response) => {
  weatherJSON = response;
  // organise the json data into some useful variables for use later
  if (isEmpty(weatherJSON) === false) {
    // cloudiness controls each max opacity for the videos
    currentClouds = scale((100 - weatherJSON.current.clouds), 0, 100, 5000, 10000);
    dayOneClouds = scale((100 - weatherJSON.daily[1].clouds), 0, 100, 5000, 10000);
    dayTwoClouds = scale((100 - weatherJSON.daily[2].clouds), 0, 100, 5000, 10000);
    dayThreeClouds = scale((100 - weatherJSON.daily[3].clouds), 0, 100, 5000, 10000);

    // wind speed controls each auto filter frequency
    currentWindSpeed = weatherJSON.current.wind_speed * 0.01;
    dayOneWindSpeed = weatherJSON.daily[1].wind_speed * 0.01;
    dayTwoWindSpeed = weatherJSON.daily[2].wind_speed * 0.01;
    dayThreeWindSpeed = weatherJSON.daily[3].wind_speed * 0.01;

    // grab the dew point for the delay time of the ping pong delay
    currentDewPoint = weatherJSON.current.dew_point;

    // if there is no current rain the API leaves the field out I think
    // so if no field then no rain in mm so set to lowest value
    if (typeof weatherJSON.current.rain == 'undefined') {
      currentRainmm = "-36";
    }
    // turn rain in mm from 0.0 - 1.5 into decibles -36db to 0db string
    else {
      currentRainmm = "-" + String(scale(weatherJSON.current.rain["1h"], 0.0, 1.5, 36, 1));
    }

    // grab the max min temps then wrap 5 so that they can pick somethign from the array
    dayOneMaxTemp = parseInt(weatherJSON.daily[0].temp.max) % 5
    dayTwoMaxTemp = parseInt(weatherJSON.daily[1].temp.max) % 5
    dayThreeMaxTemp = parseInt(weatherJSON.daily[2].temp.max) % 5
    dayFourMaxTemp = parseInt(weatherJSON.daily[3].temp.max) % 5
    dayOneMinTemp = parseInt(weatherJSON.daily[0].temp.min) % 5
    dayTwoMinTemp = parseInt(weatherJSON.daily[1].temp.min) % 5
    dayThreeMinTemp = parseInt(weatherJSON.daily[2].temp.min) % 5
    dayFourMinTemp = parseInt(weatherJSON.daily[3].temp.min) % 5

    // call the sound and video elements now we have the weather data
    window.requestAnimationFrame(step);
    droneSynth();
  }
  // set app state
}).catch((error) => {
  console.log('API error', error);
  // playing default values
  window.requestAnimationFrame(step);
  droneSynth();
})

// some useful functions
//////////////////////////////////////////////////////////////////////////
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}
/////////////////////////////////////////////////////////////////////////
function scale(number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
/////////////////////////////////////////////////////////////////////////////////
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}