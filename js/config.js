function CreateUIElement( value, parent )
{
    var ui = document.createElement( value );
    if ( parent == undefined ) document.body.appendChild( ui );
    else parent.append( ui );
    return ui;
}

function DeleteModal()
{
    const element = document.getElementById("modal-wrapper");
    const modal = document.getElementById("modal");
    if (element == undefined) return;
    element.style.opacity = "0";
    modal.style.scale = "0.9";
    setTimeout(() => {
        element.remove();
    }, 500);
}

function ClosePopup(iserror)
{
    if (iserror && request_twitchid_share)
    {
        request_twitchid_share = false;
        twitch.actions.requestIdShare();
    }
    const modal = document.getElementById(iserror ? 'modal-error' : 'modal-success');
    modal.style.scale = "0.9";
    setTimeout(() => {
        modal.remove();
    }, 500);
    if (!iserror) DeleteModal();
}

function DoModalPopup(title, msg, iserror)
{
    const ModalWrapper = document.getElementById("modal-wrapper");
    // Main Modal
    var MainModal = CreateUIElement('div', ModalWrapper);
    MainModal.setAttribute( 'class', 'modal-overlay' );
    MainModal.setAttribute( 'id', iserror ? 'modal-error' : 'modal-success' );
    MainModal.style.pointerevents = 'none';
    MainModal.style.opacity = "0";
    MainModal.style.scale = "0.9";

    // Our error info
    var ErrorInfo = CreateUIElement('p', MainModal);
    ErrorInfo.setAttribute( 'class', iserror ? 'modal-error-x' : 'modal-success-x' );
    ErrorInfo.innerHTML = iserror ? '&#x2715;' : '&#x2714;';

    var ModalDesc = CreateUIElement('div', MainModal);
    ModalDesc.setAttribute( 'class', 'modal-descriptors' );

    var DescData = CreateUIElement('h2', ModalDesc);
    DescData.textContent = title;

    DescData = CreateUIElement('p', ModalDesc);
    DescData.textContent = msg;

    // Our buttons
    var ButtonWrapper = CreateUIElement('div', ModalDesc);
    ButtonWrapper.setAttribute( 'class', 'modal-buttons' );

    // Close
    var item_btn = CreateUIElement('button', ButtonWrapper);
    item_btn.setAttribute( 'class', 'button btn-danger' );

    var OnClickString = iserror ? 'true' : 'false';
    item_btn.setAttribute( 'onclick', 'ClosePopup(' + OnClickString + ')');
    item_btn.textContent = 'Close';

    // Now that everything is created, fade the modal in.
    requestAnimationFrame(() => {
        MainModal.style.scale = "1";
        MainModal.style.opacity = "1";
    });
}

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