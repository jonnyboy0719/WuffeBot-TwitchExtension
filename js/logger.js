function GetElement(tag, attributes, appendTo)
{
    var el = document.createElement(tag);
    if (typeof attributes == 'object')
    {
        for (index in attributes)
        {
            var type = typeof attributes[index];
            if (type === "object")
            {
                for (index2 in attributes[index])
                {
                    el[index][index2] = attributes[index][index2];
                }
            }
            else
            {
                el[index] = attributes[index];
            }
        }
    }
    else
    {
        el.innerHTML = attributes;
    }
    //if (appendTo) appendTo.appendChild(el);
    if (appendTo) appendTo.insertBefore(el, appendTo.children[0]);
    return el;
}

function TwitchLog(data)
{
    twitch.rig.log(data);
    var log = document.getElementById('log');
    if (log == undefined)
        log = GetElement('div', { id: 'log' }, document.body);
    var logEntry = GetElement('div', {
        className: 'logEntry',
        innerHTML: '<div class="logValue">' + data + '</div>'
    }, log);
}
