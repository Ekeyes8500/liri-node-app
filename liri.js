require("dotenv").config();
var request = require("request")
var fs = require('fs');
var moment = require('moment');
var Spotify = require('node-spotify-api');
//spotify key path
var spotifyPath = require('./keys.js');
var spotifyKeys = spotifyPath.spotify;
var randomPath = "./random.txt"
var spotify = new Spotify(spotifyKeys);

var commandLine = process.argv;
//first entry is a command, separated from search string
var commandSlice = commandLine.slice(2, 3);
var userCommand = commandSlice[0];

//used interchangably depending on which command is given, app is a one off firing so reusing this variable should cause no issues
var dataRef;

//second entry is a search line, length indeterminate
var entrySlice = commandLine.slice(3, commandLine.length);
var userEntry;
//loop to correctly store the search term
if (process.argv.length >= 4) {
    for (i = 0; i < entrySlice.length; i++) {
        if (i === 0) {
            userEntry = entrySlice[0];
        } else {
            userEntry = userEntry + "+" + entrySlice[i]
        }
    }
} else {
    //default entries for empty commands
    if (userCommand === "spotify-this-song") {
        userEntry = "the+sign+ace+of+base"
    } else if (userCommand === "movie-this") {
        userEntry = "mr+nobody"
    } else if (userCommand === "concert-this") {
        userEntry = "gogol+bordello"
    }

}

//x for command entry, y for search terms
function runLiri() {
    //this section is where the user command is taken
    if (userCommand === "spotify-this-song") {
        spotify.request('https://api.spotify.com/v1/search?type=track&q=' + userEntry)
            .then(function (data) {
                dataRef = data.tracks.items[0];
                for (i = 0; i < dataRef.artists.length; i++) {
                    if (i === 0) {
                        var artistList = dataRef.artists[i].name
                    } else {
                        artistList = artistList + ", " + dataRef.artists[i].name
                    }

                }
                console.log("*------------------------------------------------------------------------*")
                console.log("Artist(s): " + artistList);
                console.log("Track: " + dataRef.name);
                console.log("Album: " + dataRef.album.name)
                console.log("Song Preview Link: " + dataRef.preview_url)
                console.log("*------------------------------------------------------------------------*")
            })
            .catch(function (err) {
                console.error('Error occurred: ' + err);
            });
    }

    else if (userCommand === "movie-this") {
        request("http://www.omdbapi.com/?apikey=trilogy&t=" + userEntry, function (error, response, body) {
            dataRef = JSON.parse(body);
            if (!error && response.statusCode === 200) {
                console.log("*------------------------------------------------------------------------*");
                console.log("Title: " + dataRef.Title);
                console.log("Year: " + dataRef.Year);
                console.log("IMBD: " + dataRef.imdbRating);
                console.log("Rotten Tomatoes: " + dataRef.Ratings[1].Value);
                console.log("Country: " + dataRef.Country);
                console.log("Language: " + dataRef.Language);
                console.log("Summary: " + dataRef.Plot);
                console.log("Actors: " + dataRef.Actors);
                console.log("*------------------------------------------------------------------------*");
            } else {
                console.log("Unknown error, please resubmit entry");
            }

        }
        )
    }

    else if (userCommand === "concert-this") {
        request("https://rest.bandsintown.com/artists/" + userEntry + "/events?app_id=codingbootcamp", function (error, response, body) {
            dataRef = JSON.parse(body);
            if (!error && response.statusCode === 200) {
                console.log("UPCOMING EVENTS");
                console.log("*------------------------------------------------------------------------*")
                for (i = 0; i < dataRef.length; i++) {

                    var newDate = moment(dataRef[i].datetime).format("MM/DD/YYYY")

                    console.log("Venue: " + dataRef[i].venue.name);
                    console.log("Location: " + dataRef[i].venue.city + ", " + dataRef[i].venue.region);
                    console.log("Date: " + newDate)
                    console.log("*------------------------------------------------------------------------*")
                }
            } else {
                console.log("Unknown error, please resubmit entry");
            }
        });

    }

    else if (userCommand === "do-what-it-says") {
        fs.readFile("random.txt", "utf-8", function (err, data) {
            if (err) throw err;
            console.log(data)
            var dataSplit = data.split(",")
            userCommand = dataSplit[0];
            userEntry = dataSplit[1];
            runLiri();
        })

    }
}
runLiri();

