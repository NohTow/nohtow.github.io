

function toggleSettings(){
    if($('.setting-panel').hasClass('active')) {
        //$(this).removeClass('active');
        $('.setting-panel').removeClass('active');
    }
    else {
        $(this).addClass('active');
        $('.setting-panel').addClass('active');
    }
    return false;
};
$("#closeSetting").hide();
$("#settingMenu").hide();
$("#toggleSetting").hide();;
$("#toggleSetting").click(function(){
    $("#toggleSetting").hide("fade",200);
    $("#settingMenu").show("slide", { direction: "right" }, 1000, function(){
      $("#closeSetting").show("fade", 500);
    });

    
});

$("#closeSetting").click(function(){
    $("#closeSetting").hide();
    $("#settingMenu").hide("slide", { direction: "right" }, 1000);
    $("#toggleSetting").show();
});

// a key map of allowed keys
var allowedKeys = {
    65: 'a',
    66: 'b',
    67: 'c',
    70: 'f',
    72: 'h',
    73: 'i',
    78: 'n'
  };
  
  // the 'official' Konami Code sequence
  var konamiCode = ['c','h','a','f','f','i','n'];
  
  // a variable to remember the 'position' the user has reached so far.
  var konamiCodePosition = 0;
  
  // add keydown event listener
  document.addEventListener('keydown', function(e) {
    // get the value of the key code from the key map
    var key = allowedKeys[e.keyCode];
    // get the value of the required key from the konami code
    var requiredKey = konamiCode[konamiCodePosition];
  
    // compare the key with the required key
    if (key == requiredKey) {
  
      // move to the next key in the konami code sequence
      konamiCodePosition++;
  
      // if the last key is reached, activate cheats
      if (konamiCodePosition == konamiCode.length) {
        activateCheats();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  });
  
  function activateCheats() {
    $("#closeSetting").hide();
    $("#settingMenu").hide();
    $("#toggleSetting").show("fade",250);
  }