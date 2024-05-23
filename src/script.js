import {get, set} from 'idb-keyval';
import formatString from './helpers/formatString';

let locale = navigator.language.split('-')[0];
let sb = document.getElementById('sbar');


// Store list of results, ignore duplicates
let searchList = [];

// Store formatteda and un-formatted list of weapons from definitions
let formattedWeaponsList = [];
let weaponsList = [];

// Fetch definitions
fetchDefinitions();



// Fetch and format manifest/definitions
async function fetchDefinitions() {

    // Set config
    let url = 'https://www.bungie.net/Platform/Destiny2/Manifest/';
    let config = {
        method: "GET",
        headers: {
            "X-API-Key": "632a99eecbdc40149684e6fe2fd8b3f4",
            "Content-Type": "application/json"
        },
        mode: 'cors'
    };

    // Fetch manifest
    let manifest = await fetch(url, config).then((data) => {
        return data.json();
    }).catch((error) => {
        console.error(error);
    });

    let manifestVersion = manifest.Response.version;
    let storedManifestVersion = window.localStorage.getItem('destinyManifestVersion');

    // Check if stored manifest is out of date, or doesn't exist
    if (manifestVersion !== storedManifestVersion) {

        window.localStorage.setItem('destinyManifestVersion', manifest.Response.version);

        // Fetch suffix URL
        let suffix = manifest.Response.jsonWorldComponentContentPaths[locale].DestinyInventoryItemDefinition;
        url = `https://www.bungie.net${suffix}`;
    
        // Fetch definitions
        let defs = await fetch(url).then((data, config) => {
            return data.json();
        }).catch((error) => {
            console.error(error);
        });
    
        // Store definitions keyval pairs
        set('DestinyInventoryItemDefinition', defs);
    };

    console.log('🐕‍🦺 Fetched Definitions');

    // Make weapons list
    makeList();
};

// Create list of all weapon names
async function makeList() {

    // Pull definitions
    let definitionItems = await get('DestinyInventoryItemDefinition');

    // Loop over items in definitions
    for (let item of Object.values(definitionItems)) {
        if (item.itemType === 3) {
            
            // Remove apostrophes and enforce titleCase
            let itemName = item.displayProperties.name;
            itemName = formatString(itemName);
            formattedWeaponsList.push(itemName);

            weaponsList.push(item.displayProperties.name); // un-formatted weapons list
        };
    };
};

// Fetch articles via searchText
let searchByText = async function(searchText) {

    searchText = formatString(searchText);

    // Find weapon name in definitions
    let index = formattedWeaponsList.indexOf(searchText);
    let newSearchText = weaponsList[index];
    console.log(`${searchText} : ${newSearchText}`);


    // Set config
    let url = `https://www.bungie.net/Platform/Content/Search/${locale}/?searchtext=${newSearchText}&ctype=news`;
    let config = {
        method: "GET",
        headers: {
            "X-API-Key": "632a99eecbdc40149684e6fe2fd8b3f4"
        }
    };
    
    // Do request
    let response = await fetch(url, config).catch((error) => {
        console.error(error);
    });
    
    // Ignore mismatched origin (lazy fix) and empty field
    if (newSearchText !== '' && response.ErrorCode !== 2107) {
        return response.json();
    };
};

// "Use" response
let parseResponse = async function(data) {
    
    // Ignore invalid responses
    let results = data.Response.results;
    if (results.length > 0 && results[0].cmsPath) {

        document.getElementById('results').innerHTML = ''; // check for recurring search term
        
        let index = 0;
        window.localStorage.setItem('results', JSON.stringify({})); // init

        // Loop over results, add to DOM
        for (let result of results) {
            
            // Ignore duplicate results
            let title = `${result.cmsPath} - ${result.creationDate}`;
            if (!searchList.includes(title)) {

                // Create, append to DOM
                let resdiv = document.createElement('div');
                resdiv.innerHTML = title;
                resdiv.setAttribute('data-index', index);
                document.getElementById('results').appendChild(resdiv);

                // Save result to localstorage obj
                let obj = JSON.parse(window.localStorage.getItem('results'));
                obj[index] = result.properties.Content;
                console.log(result);
                window.localStorage.setItem('results', JSON.stringify(obj));

                // Add to list
                searchList.push(title);
                index++;
                console.log(title);

                // Use attribute to display content
                resdiv.addEventListener('click', () => {readAttr(resdiv, data)});
            };
        };
    };
};

// Read attribute from element onclick
function readAttr(div, data) {
    
    // Get stored results and selected-entry index
    let query = data.Response.query.searchText;
    console.log(query);
    let storedresults = JSON.parse(window.localStorage.getItem('results'));
    let index = div.getAttribute('data-index');

    // Highlight search term in content
    let regex = new RegExp(query, 'gi');
    let content = storedresults[index].replace(/(<mark class="highlight">|<\/mark>)/gim, '');

    // -- and change DOM content
    document.getElementById('mid').style.display = 'none';
    document.getElementById('titleresult').innerHTML = `Viewing: ${div.innerHTML}`;
    document.getElementById('singleresult').innerHTML = content.replace(regex, '<mark class="highlight">$&</mark>');

    // Scroll to highlighted word (unsure when multiple)
    window.scrollBy(0, document.evaluate(`//*[text()[contains(., '${query}')]][last()]`, document.body).iterateNext().getBoundingClientRect().top);
};


// Retro-active event search (on key press it searches)
sb.addEventListener('keyup', (event) => {

    // Exclude modifier keys from event
    if (event.code !== 'Enter' && event.code !== 'ShiftLeft' && event.code !== 'ControlLeft' && event.code !== 'CapsLock' && event.code !== 'Space') {
        searchByText(sb.value).then((data) => { // Fetch URL

            if (data) { // Ignore falsy return
                parseResponse(data);
            };
        });
    };
});