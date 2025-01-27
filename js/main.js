var token = "";
var tuid = "";
var ebs = "";
var public_key = '';
var id_cache = undefined;

// because who wants to type this every time?
var twitch = window.Twitch.ext;
// Our backend API location
var BackEndLoc = 'https://api.wuffesan.com/soundalerts/';
// Gets replaced in onAuthorized, but its here mostly for debugging purposes.
var broadcasterid = '47259957';

// Our products
var productlist = [];
function AddProductData(product)
{
    var item = {
        id: product.id,
        image: 'https://wuffesan.com/twitchbot/' + product.item_image,
        desc: product.item_desc,
        name: product.item_name,
        isbits: product.isbits,
        sku: product.sku
    }
    productlist.push( item );
}

function GetProduct(id)
{
    var element_found = productlist[0];
    productlist.forEach(element => {
        if ( element.id == id )
            element_found = element;
    });
    return element_found
}

// create the request options for our Twitch API calls
var requests = {
    buy_item: {
        type: 'item',
        function: DoBuyItem,
        call: 'POST'
    },
    get_items: {
        type: 'get',
        function: OnRetrieveItems,
        call: 'GET'
    }
};

twitch.configuration.onChanged(function() {
    // Checks if configuration is defined
    if (twitch.configuration.broadcaster) {
      try {
        // Parsing the array saved in broadcaster content
        var config = JSON.parse(twitch.configuration.broadcaster.content);
        
        // Checking the content is an object
        if (typeof config === 'object') {
          LoadConfig(config);
        } else {
          console.log('Invalid config');
        }
      } catch (e) {
        console.log('Invalid config');
      }
    }
});

function LoadConfig(config)
{
    public_key = config[0].key;
}

twitch.onAuthorized(function(auth) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;

    // Our channel ID
    broadcasterid = auth.channelId;

    // Grab our items once we got auth.
    DoAction(requests.get_items, undefined);
});

twitch.bits.onTransactionComplete(function(data) {
    if (!data.transactionId)
    {
        DoModalPopup( 'An error has occurred.', 'If you made a purchase from another tab/browser/mobile, you can safely ignore this message.', true );
        return;
    }
    id_cache += '&key=' + public_key;
    id_cache += '&transaction_id=' + data.transactionId;
    if ( data.product == 'inDevelopment' ) id_cache += '&dev=1';
    else id_cache += '&dev=0';
    id_cache += '&buyer=' + data.displayName;
    DoAction(requests.buy_item, id_cache);
});

twitch.bits.onTransactionCancelled( function() {
    DoModalPopup( 'Transaction cancelled.', 'The transaction was cancelled.', true );
});

function DoBuyItem(data, failure)
{
    id_cache = undefined;
    if ( failure )
    {
        DoModalPopup( 'Transaction failed(?).', data.error, true );
        return;
    }
    DoModalPopup( 'Transaction completed', data.success, false );
}

function OnRetrieveItems(data, failure)
{
    if ( failure )
    {
        DoModalPopup( 'An error has occurred.', data.error, true );
        return;
    }

    // Clear previous list
    productlist = [];
    // Populate new one
    for (var key in data)
        AddProductData( data[key] );

    PopulateItemTable();
}

function CleanUpSKU( sku ) { return sku.replace("bits", ''); }

function OnRedeem( id, reedem )
{
    if ( reedem == false )
    {
        // Delete the wrapper
        DeleteModal();
        return;
    }
    if( !token )
    {
        DoModalPopup( 'An error has occurred.', 'You need to login to buy items.', true );
        return;
    }
    id_cache = '&id=' + id;
    twitch.bits.useBits( GetProduct( id ).sku );
}

function ShowItemDetails( id )
{
    // Our wrapper
    var ModalWrapper = CreateUIElement('div', undefined);
    ModalWrapper.setAttribute( 'class', 'modal-wrapper' );
    ModalWrapper.setAttribute( 'id', 'modal-wrapper' );
    ModalWrapper.style.opacity = "0";

    // Main Modal
    var MainModal = CreateUIElement('div', ModalWrapper);
    MainModal.setAttribute( 'class', 'modal' );
    MainModal.setAttribute( 'id', 'modal' );
    MainModal.style.scale = "0.9";

    // Inside Modal
    var InsideModal = CreateUIElement('div', MainModal);
    InsideModal.setAttribute( 'class', 'modal-inside-wrapper' );

    // Our product data
    var product = GetProduct( id );

    // Our main image
    if ( product.image.includes(".webm") || product.image.includes(".mp4") )
	{
        var videobase = CreateUIElement('video', InsideModal);
		videobase.setAttribute( 'style', 'margin-left: auto;margin-right: auto; display: block;' );
		videobase.setAttribute( 'onloadstart', 'this.volume=0' );
		videobase.setAttribute( 'height', '125' );
		videobase.volume = 0;
		videobase.loop = true;
		videobase.autoplay = true;
        var myvideo = CreateUIElement('source', videobase);
		myvideo.setAttribute( 'type', 'video/webm' );
		myvideo.setAttribute( 'src', product.image );
	}
	else
	{
        var MainImage = CreateUIElement('img', InsideModal);
        MainImage.setAttribute( 'class', 'modal-image' );
        MainImage.setAttribute( 'src', product.image );
	}

    // Name of our product
    var MainHeader = CreateUIElement('h2', InsideModal);
    MainHeader.style.margin = '0';
    MainHeader.textContent = product.name;

    // Description of our product
    var ItemDescription = CreateUIElement('p', InsideModal);
    ItemDescription.style.margin = '0';
    ItemDescription.textContent = product.desc;

    // Price of our product
    var PriceWrapper = CreateUIElement('div', InsideModal);
    PriceWrapper.style.display = 'flex';
    PriceWrapper.style.fontSize = 'large';
    PriceWrapper.style.textEmphasis = 'bold';

    var BitsImage = CreateUIElement('img', PriceWrapper);
    BitsImage.setAttribute( 'class', 'bits-image' );
    BitsImage.setAttribute( 'src', 'assets/bits.gif' );

    // Description of our product
    var BitsPrice = CreateUIElement('p', PriceWrapper);
    BitsPrice.setAttribute( 'class', 'bits-text' );
    BitsPrice.textContent = CleanUpSKU( product.sku ) + ' Bits';

    // Our buttons
    var ButtonWrapper = CreateUIElement('div', MainModal);
    ButtonWrapper.setAttribute( 'class', 'modal-buttons' );

    // Redeem
    var item_btn = CreateUIElement('button', ButtonWrapper);
    item_btn.setAttribute( 'class', 'button btn-success' );
	item_btn.setAttribute( 'id', 'redeem_item' );
    item_btn.textContent = 'Redeem';

    // Cancel
    var item_btn = CreateUIElement('button', ButtonWrapper);
    item_btn.setAttribute( 'class', 'button btn-danger' );
	item_btn.setAttribute( 'id', 'close_item' );
    item_btn.textContent = 'Cancel';

    // Now that everything is created, fade the modal in.
    requestAnimationFrame(() => {
        MainModal.style.scale = "1";
        MainModal.style.opacity = "1";
        ModalWrapper.style.opacity = "1";
    });

    $('#redeem_item').click(function () {
        OnRedeem( product.id, true );
    });
    $('#close_item').click(function () {
        OnRedeem( product.id, false );
    });
}

function AddNewTableItem( item )
{
    var items_div = document.getElementById('items');
    var item_div = CreateUIElement('div', items_div);
	item_div.setAttribute( 'class', 'item' );
	item_div.setAttribute( 'id', 'show_' + item.id );
	// Image (or video)
    if ( item.image.includes(".webm") || item.image.includes(".mp4") )
	{
        var videobase = CreateUIElement('video', item_div);
		videobase.setAttribute( 'style', 'margin-left: auto;margin-right: auto; display: block;' );
		videobase.setAttribute( 'onloadstart', 'this.volume=0' );
		videobase.setAttribute( 'height', '125' );
		videobase.volume = 0;
		videobase.loop = true;
		videobase.autoplay = true;
        var myvideo = CreateUIElement('source', videobase);
		myvideo.setAttribute( 'type', 'video/webm' );
		myvideo.setAttribute( 'src', item.image );
		videobase.append( myvideo );
	}
	else
	{
        var item_img = CreateUIElement('img', item_div);
		item_img.setAttribute( 'src', item.image );
	}
	// Name of the item
    var item_span = CreateUIElement('span', item_div);
	item_span.textContent = item.name;
	// Our button
    var item_btn = CreateUIElement('button', item_div);
	item_btn.innerHTML = '<span class="buy_button">' + CleanUpSKU( item.sku ) + ' Bits</span>';
	item_btn.setAttribute( 'class', 'button' );
    $('#show_' + item.id).click(function () {
        ShowItemDetails( item.id );
    });
}

function PopulateItemTable()
{
    var items_div = document.getElementById('items');
    items_div.innerHTML = '';
    productlist.forEach( element =>
    {
        AddNewTableItem( element );
    });
}

function DoAction(request, input)
{
    var args = '';
    if (input) args = input;
    fetch(
        BackEndLoc + request.type + '?userid=' + broadcasterid + args,
        {
            method: request.call,
            headers: {
                authorization: 'Bearer ' + token
            }
        }
    )
    .then(resp => {
        return resp.json();
    })
    .then(resp => {
        if (resp.error)
        {
            request.function(resp, true);
            return;
        }
        request.function(resp, false);
    })
    .catch(err => {
        if (err.message)
            DoModalPopup( 'An error has occurred.', err.message, true );
        else
        DoModalPopup( 'An error has occurred.', 'A fatal error has occured.', true );
    });
}
