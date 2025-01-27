var token, userId;
var options = [];

// so we don't have to write this out everytime 
const twitch = window.Twitch.ext;

twitch.onAuthorized(function(auth) {
    // save our credentials
    token = auth.token;
    userId = auth.userId;
});

twitch.configuration.onChanged(function() {
    // Checks if configuration is defined
    if (twitch.configuration.broadcaster) {
      try {
        // Parsing the array saved in broadcaster content
        var config = JSON.parse(twitch.configuration.broadcaster.content);
        
        // Checking the content is an object
        if (typeof config === 'object') {
          // Updating the value of the options array to be the content from config
          options = config;
          updateOptions();
        } else {
          console.log('Invalid config');
        }
      } catch (e) {
        console.log('Invalid config');
      }
    }
});

function updateOptions() {
    const MyPublicKey = document.getElementById("publickey");
    MyPublicKey.value = options[0].key;
}

$(function() {
    $('#config').submit(function(e) {
      e.preventDefault();
      options = [];
      $('input[type=text]').each(function() {
          var option = {
            key: $(this).val()
          };
          options.push(option);
      });
      twitch.configuration.set('broadcaster', '', JSON.stringify(options));
      DoModalPopup('Config Updated!', 'Your changes has now been saved.', false);
    });
});