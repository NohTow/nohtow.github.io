/* global $*/
/* global SpotifyWebApi */
/* global jQuery */
/* global StyleFix */
/* global location */

//PrefixFree jQuery addon
(function($, self){

if(!$ || !self) {
	return;
}

for(var i=0; i<self.properties.length; i++) {
	var property = self.properties[i],
		camelCased = StyleFix.camelCase(property),
		PrefixCamelCased = self.prefixProperty(property, true);

	$.cssProps[camelCased] = PrefixCamelCased;
}

})(window.jQuery, window.PrefixFree);

var s = new SpotifyWebApi();

var CLIENT_ID = "6beecd543ea04b7b9f5aba153c98151e";
var REDIRECT_URI = "https://natinusala.github.io/spotify-library-blind-test/callback.html";
var SCORE_CAP = 75;

function getLoginURL(scopes) {
			return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID
				+ '&redirect_uri=' + encodeURIComponent(REDIRECT_URI)
				+ '&scope=' + encodeURIComponent(scopes.join(' '))
				+ '&response_type=token';
		}

function openLogin()
{
    var url = getLoginURL([
					'user-library-read',
					'playlist-read-private',
					'playlist-read-collaborative',
	]);

	var width = 450,
			height = 730,
			left = (screen.width / 2) - (width / 2),
			top = (screen.height / 2) - (height / 2);

	var w = window.open(url,
			'Spotify',
			'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
	);
}

var total = 0;
var limit = -1;
var loaded = 0;
var songs = [];
var song;
var audio;
var totalSongs = 0;
var totalScore = 0;
var selectedPlaylist = null;
var playlists = [];
var isAnimating = false;

function setLoadingProgress(progress)
{
    $("#loadingProgress").text( progress + "/" + total);
    $("#loadingBar").css("width", (progress/total) * 100 + "%");
}

function loadPlaylists()
{
    $("#playlistSelection").show();
    $("#login").css("transform", "translate(-150%,-50%)");
    $("#playlistSelection").css("transform", "translate(-50%,-50%)");
    
    setTimeout(function(){
        $("#login").hide();
    }, 1000);

    // Try getting current user's playlists using the simpler method
    s.getUserPlaylists({limit: 50}, function(error, data) {
        if (error) {
            console.error('Error loading playlists:', error);
            console.log('Full error object:', error);
            return;
        }
        
        console.log('Playlist data received:', data);
        
        if (!data || !data.items) {
            console.error('No playlist data received');
            return;
        }
        
        console.log('Number of playlists found:', data.items.length);
        playlists = data.items;
        displayPlaylists();
    });
}

function displayPlaylists() {
    var playlistHTML = '';
    
    for (var i = 0; i < playlists.length; i++) {
        var playlist = playlists[i];
        var imageUrl = playlist.images && playlist.images.length > 0 ? playlist.images[playlist.images.length - 1].url : '';
        var imageHTML = imageUrl ? '<img src="' + imageUrl + '" style="width: 64px; height: 64px; margin-right: 15px; border-radius: 4px;" />' : 
                                   '<div style="width: 64px; height: 64px; background: #ccc; margin-right: 15px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fa fa-music" style="color: #666;"></i></div>';
        
        playlistHTML += '<div class="playlist-item" onclick="selectPlaylist(\'' + playlist.id + '\')" style="cursor: pointer; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">';
        playlistHTML += '    <div style="display: flex; align-items: center;">';
        playlistHTML += '        ' + imageHTML;
        playlistHTML += '        <div>';
        playlistHTML += '            <h4 style="margin: 0;">' + playlist.name + '</h4>';
        playlistHTML += '            <p style="margin: 0; color: #666;">' + playlist.tracks.total + ' tracks</p>';
        playlistHTML += '        </div>';
        playlistHTML += '    </div>';
        playlistHTML += '</div>';
    }
    
    $("#playlistList").html(playlistHTML);
}

function selectPlaylist(playlistId) {
    console.log('Selecting playlist with ID:', playlistId);
    selectedPlaylist = playlists.find(function(p) { return p.id === playlistId; });
    console.log('Selected playlist object:', selectedPlaylist);
    if (selectedPlaylist) {
        console.log('Playlist ID to use for API:', selectedPlaylist.id);
    }
    loadSongs();
}

function selectSavedTracks() {
    selectedPlaylist = null;
    loadSongs();
}

function loadSongs()
{
    $("#loading").show();
    $("#playlistSelection").css("transform", "translate(-150%,-50%)");
    $("#loading").css("transform", "translate(-50%,-50%)");
    
    setTimeout(function(){
        $("#playlistSelection").hide();
    }, 1000);

    if (selectedPlaylist === null) {
        // Load saved tracks (original behavior)
        s.getMySavedTracks({
                limit: 1,
                offset: 0,
            },
            function(error, data)
            {
                total = data.total;

                if (limit != -1 && total > limit)
                    total = limit;

                setLoadingProgress(0);

                //Run the 1st iteration
                loadSongsIteration();
            }
        );
    } else {
        // Load playlist tracks
        console.log('Loading tracks for playlist ID:', selectedPlaylist.id);
        s.getPlaylistTracks(selectedPlaylist.owner.id, selectedPlaylist.id, {
                limit: 1,
                offset: 0,
            },
            function(error, data)
            {
                if (error) {
                    console.error('Error loading playlist tracks:', error);
                    return;
                }
                
                if (!data) {
                    console.error('No playlist track data received');
                    return;
                }
                
                total = data.total;

                if (limit != -1 && total > limit)
                    total = limit;

                setLoadingProgress(0);

                //Run the 1st iteration
                loadSongsIteration();
            }
        );
    }
}

function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function getScore(guessed, original)
{
    guessed = guessed.toLowerCase();
    original = original.toLowerCase();

    var score = original.length - getEditDistance(guessed, original);
    return score / original.length * 100;
}

function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];

  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) == a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

$(document).ready(function(){
    $("#songGuess").keydown(function(event){
        if(event.keyCode == 13)
        {
            guess();
        }
        else if (event.keyCode == 9)
        {
            event.preventDefault();
            $("#artistGuess").focus();
        }
    });

    $("#artistGuess").keydown(function(event){
        if(event.keyCode == 13)
        {
            guess();
        }
        else if (event.keyCode == 9)
        {
            event.preventDefault();
            $("#songGuess").focus();
        }
    });

    jQuery.fn.shake = function(intShakes, intDistance, intDuration) {
        this.each(function() {
            $(this).css("position","relative");
            for (var x=1; x<=intShakes; x++) {
            $(this).animate({left:(intDistance*-1)}, (((intDuration/intShakes)/4)))
        .animate({left:intDistance}, ((intDuration/intShakes)/2))
        .animate({left:0}, (((intDuration/intShakes)/4)));
        }
      });
    return this;
    };

    $("#login").show();
    $("#login").css("transform", "translate(-50%, -50%)");
});

function guess()
{
    var reduceSongName = function (songName) {
        if (songName.lastIndexOf(' - ') != -1)
            songName = songName.substr(0, songName.lastIndexOf(' - ')-1);

        songName = songName.replace(/ *\([^)]*\) */g, "").trim();

        return songName;
    }

    var guessedSongName = reduceSongName($("#songGuess").val());
    var songNameToCompareTo = reduceSongName(song.track.name);

    var guessedArtistName = $("#artistGuess").val();

    var songDisabled = $("#songGuess").prop("disabled");
    var artistDisabled = $("#artistGuess").prop("disabled");

    if (guessedSongName !== "" && !songDisabled)
    {
        var score = getScore(guessedSongName, songNameToCompareTo);
        if (score >= SCORE_CAP)
        {
            $("#songGuess").val(song.track.name);
            $("#songGuess").prop("disabled", true);
            $("#formGroupSong").addClass("has-success");
        }
        else
        {
            $("#formGroupSong").addClass("has-error");
            $("#songGuess").val("");
            $("#songGuess").shake(2, 10, 200);
        }
    }

    if (guessedArtistName !== "" && !artistDisabled)
    {
        var score = getScore(guessedArtistName, song.track.album.artists[0].name);
        if (score >= SCORE_CAP)
        {
            $("#artistGuess").val(createArtistsString(song));
            $("#artistGuess").prop("disabled", true);
            $("#formGroupArtist").addClass("has-success");
        }
        else
        {
            $("#formGroupArtist").addClass("has-error");
            $("#artistGuess").val("");
            $("#artistGuess").shake(2, 10, 200);
        }
    }

    songDisabled = $("#songGuess").prop("disabled");
    artistDisabled = $("#artistGuess").prop("disabled");

    if (songDisabled && artistDisabled)
    {
        result();
    }
}

function logout()
{
    location.reload();
}

function createArtistsString(song)
{
    var string = song.track.artists[0].name + ", ";

    for (var i = 1; i < song.track.artists.length-1; i++)
    {
        string += song.track.artists[i].name + ", ";
    }

    string = string.substr(0, string.length-2);

    return string;
}

function getCoverForSong(song)
{
    var arr = song.track.album.images;
    return arr[arr.length - 1].url;
}

function result()
{
    audio.pause();

    $("#songName").text(song.track.name);
    $("#artistName").text(createArtistsString(song));

    $("#albumCover").attr("src", getCoverForSong(song));

    var songDisabled = $("#songGuess").prop("disabled");
    var artistDisabled = $("#artistGuess").prop("disabled");

    if (songDisabled && artistDisabled)
    {
        $("#resultText").text("Congratulations ! You found the song and the artist name !");
        totalScore += 1;
    }
    else if (songDisabled && !artistDisabled)
    {
        $("#resultText").text("Not bad ! You found the song !");
        totalScore += 0.5;
    }
    else if (!songDisabled && artistDisabled)
    {
        $("#resultText").text("Not bad ! You found the artist !");
        totalScore += 0.5;
    }
    else if (!songDisabled && !artistDisabled)
    {
        $("#resultText").text("Oops, you didn't find anything");
    }

    totalSongs++;

    $("#successRate").text(totalScore + " points earned out of a total of " + totalSongs + " tracks");

    $("#result").show();
    isAnimating = true;

    $("#game").css("transform", "translate(-150%,-50%)");
    $("#result").css("transform", "translate(-50%,-50%)");

    setTimeout(function(){
        $("#game").hide();
        isAnimating = false;
    }, 1000);
}

function nextSong()
{
    if (isAnimating) {
        return;
    }
    
    isAnimating = true;
    startGameForNewSong();
    $("#game").show();

    $("#result").css("transform", "translate(50%,-50%)");
    $("#game").css("transform", "translate(-50%,-50%)");

    setTimeout(function(){
        $("#result").hide();
        isAnimating = false;
    }, 1000);
}

function ready()
{
    isAnimating = true;
    startGameForNewSong();

    $("#game").show();

    $("#ready").css("transform", "translate(-150%,-50%)");
    $("#game").css("transform", "translate(-50%,-50%)");

    setTimeout(function(){
        $("#ready").hide();
        isAnimating = false;
    }, 1000);
}

function startGameForNewSong()
{
    $("#songGuess").prop("disabled", false);
    $("#artistGuess").prop("disabled", false);

    $("#formGroupArtist").removeClass("has-success");
    $("#formGroupSong").removeClass("has-success");

    $("#formGroupSong").removeClass("has-error");
    $("#formGroupArtist").removeClass("has-error");

    $("#songGuess").val("");
    $("#artistGuess").val("");

    // Check if we have any songs left
    if (songs.length === 0) {
        console.log("No more songs available!");
        $("#resultText").text("You've played all available songs!");
        $("#result").show();
        $("#game").css("transform", "translate(-150%,-50%)");
        $("#result").css("transform", "translate(-50%,-50%)");
        setTimeout(function(){
            $("#game").hide();
        }, 1000);
        return;
    }

    //Pick a random song
    var randIndex = Math.floor(Math.random()*songs.length);
    song = songs[randIndex];
    
    // Remove the song from the array so it won't be played again
    songs.splice(randIndex, 1);

    //Play it
    audio = new Audio(song.track.preview_url);
    audio.volume = 0.05;
    audio.onended = result;
    $("#time").text("30");
    audio.ontimeupdate = function()
    {
        $("#time").text(Math.floor(audio.duration) - Math.floor(audio.currentTime));
    }
    
    // Print the correct answer in console
    console.log("🎵 Current song: " + song.track.name + " by " + createArtistsString(song));
    console.log("Songs remaining: " + songs.length);
    
    audio.play().catch(err => {
        console.error(err);
        // Song was already removed from array above, so just try again
        startGameForNewSong();
    });
}

function loadSongsIteration()
{
    if (selectedPlaylist === null) {
        // Load saved tracks
        s.getMySavedTracks({
                limit: 50,
                offset: loaded,
            },
            function(error, data)
            {
                var filteredData = data.items.filter(({track}) => !!track.preview_url);
                songs = songs.concat(filteredData);
                loaded += data.items.length;
                setLoadingProgress(loaded);

                if (loaded < total)
                {
                    //Continue loading
                    loadSongsIteration();
                }
                else
                {
                    //Start the game
                    songs = shuffle(songs);

                    $("#ready").show();

                    $("#loading").css("transform", "translate(-150%,-50%)");
                    $("#ready").css("transform", "translate(-50%,-50%)");

                    setTimeout(function(){
                        $("#loading").hide();
                    }, 1000);
                }
            }
        );
    } else {
        // Load playlist tracks
        s.getPlaylistTracks(selectedPlaylist.owner.id, selectedPlaylist.id, {
                limit: 50,
                offset: loaded,
            },
            function(error, data)
            {
                if (error) {
                    console.error('Error loading playlist tracks:', error);
                    return;
                }
                
                if (!data || !data.items) {
                    console.error('No playlist track data received');
                    return;
                }
                
                var filteredData = data.items.filter(function(item) { 
                    return item.track && item.track.preview_url; 
                });
                songs = songs.concat(filteredData);
                loaded += data.items.length;
                setLoadingProgress(loaded);

                if (loaded < total)
                {
                    //Continue loading
                    loadSongsIteration();
                }
                else
                {
                    //Start the game
                    songs = shuffle(songs);

                    $("#ready").show();

                    $("#loading").css("transform", "translate(-150%,-50%)");
                    $("#ready").css("transform", "translate(-50%,-50%)");

                    setTimeout(function(){
                        $("#loading").hide();
                    }, 1000);
                }
            }
        );
    }
}

window.onmessage = function (e) {
  var data = JSON.parse(e.data);
  if (data.type == "access_token")
  {
      s.setAccessToken(data.access_token);

      setTimeout(loadPlaylists, 1000);
  }
};
