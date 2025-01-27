var request_twitchid_share = false;

function CreateUIElement( value, parent )
{
    var ui = document.createElement( value );
    if ( parent == undefined ) document.body.appendChild( ui );
    else parent.append( ui );
    return ui;
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
	item_btn.setAttribute( 'id', 'close_popup' );
    item_btn.textContent = 'Close';

    // Now that everything is created, fade the modal in.
    requestAnimationFrame(() => {
        MainModal.style.scale = "1";
        MainModal.style.opacity = "1";
    });

    $('#close_popup').click(function () {
        ClosePopup( iserror ? true : false );
    });
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