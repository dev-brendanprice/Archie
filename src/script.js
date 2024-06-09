import {get, set} from 'idb-keyval';
import formatString from './helpers/formatString';
import ScrollTo from './helpers/scrollTo';

window.scrollTo(0, 0); // Lazy load-scroll fix
let locale = navigator.language.split('-')[0];
let sb = document.getElementById('sbar');

// Store formatted and un-formatted list of weapons from definitions
let formattedWeaponsList = []; // [Deprecate this]
let weaponsList = []; // [Deprecate this]

// Fetch definitions
fetchDefinitions(); // [Deprecate this]



// Fetch and format manifest/definitions
async function fetchDefinitions() {

    // Set config
    let url = 'https://www.bungie.net/Platform/Destiny2/Manifest/';
    let config = {
        method: "GET",
        headers: {
            "X-API-Key": "e5cc8b67680f4a1b90ff76e1aac00036",
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
    console.log('input:',searchText);
    // Set config
    let url = `https://www.bungie.net/Platform/Content/Search/${locale}/?searchtext=${searchText}&ctype=help news`;
    let config = {
        method: "GET",
        headers: {
            "X-API-Key": "e5cc8b67680f4a1b90ff76e1aac00036"
        }
    };
    
    // Do request
    let response = await fetch(url, config).catch((error) => {
        console.error(error);
    });
    
    // Ignore mismatched origin (lazy fix) and empty field
    if (searchText !== '' && response.ErrorCode !== 2107) {
        return response.json();
    };
};

// Use response
let parseResponse = function(data) {

    // Localised vars
    const response = data.Response.results;
    const resultsArr = {};

    // Create array of results
    for (let result of response) {
        resultsArr[result.properties.Title] = result.properties.Content;
    };

    // Counter, init & LocalStorage
    let i = 0;
    let localStorageObj = {};
    window.localStorage.setItem('results', JSON.stringify({}));
    document.getElementById('results').innerHTML = ''; // Remove current DOM list

    // Map over array and create DOM elements for each
    Object.entries(resultsArr).forEach((item) => {
        
        // Create new div with attr, add to DOM & LocalStorage
        const div = document.createElement('div');
        localStorageObj[i] = item[1];
        div.innerHTML = item[0];
        div.setAttribute('data-index', i);
        div.addEventListener('click', () => {readAttr(div, data)});
        document.getElementById('results').appendChild(div);
        i++;
    });

    // Add results to LocalStorage
    window.localStorage.setItem('results', JSON.stringify(localStorageObj));
};

// Read attribute from element onclick
function readAttr(div, data) {

    // DOM content
    document.getElementById('singlerescon').style.display = 'block';
    
    // Get stored results and selected-entry index
    let query = data.Response.query.searchText;
    let storedResults = JSON.parse(window.localStorage.getItem('results'));
    let index = div.getAttribute('data-index');
    console.log('return search:',data.Response.query.searchText);

    // Highlight search term in content
    let regex = new RegExp(query, 'gi');
    let content = storedResults[index].replace(/(<mark class="highlight">|<\/mark>)/gim, '');

    // Change DOM content
    document.getElementById('mid').style.display = 'none';
    document.getElementById('titleresult').innerHTML = `Viewing: ${div.innerHTML}`;
    document.getElementById('singleresult').innerHTML = content.replace(regex, '<mark class="highlight">$&</mark>');

    // Scroll to matching query
    let matches = {};
    try {

        query = query.toLowerCase();

        // Search for query in document using XPath
        const xpathResult = document.evaluate(
            `//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${query}')]`,
            document.body,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        // Find all matching strings
        matches = {};
        for (let i=0; i<xpathResult.snapshotLength; i++) {
            matches[i] = xpathResult.snapshotItem(i);
        };

        // Show reader controls
        document.getElementById('readerControlReferenceTag').innerHTML = `${0} of ${Object.keys(matches).length} references`;
        document.getElementById('readerControlsContainer').style.display = 'block';

    }
    catch (e) {
        console.error(e);
    };

    // Reader control events
    let counter = 0;
    let matchLen = Object.keys(matches).length;


    // Event for "Next" reader control
    document.getElementById('readerControlNext').addEventListener('click', () => {

        // Check for counter === length of matches array
        if (counter + 1 === matchLen) {

            // Scroll to the bounding space of the matching string and return
            counter += 1;
            document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${matchLen} matches`;
            ScrollTo(matches[counter-1]);
            return;
        };

        // Check if counter will surpass the length of the matches array, if so reset to 0
        if (counter === matchLen) {
            counter = 0;
        }
        else { counter += 1; }; // Increment the counter

        // Scroll to the bounding space of the matching string
        document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${matchLen} matches`;
        ScrollTo(matches[counter]);
    });

    // Event for "Previous" reader control
    document.getElementById('readerControlPrevious').addEventListener('click', () => {

        // Check for counter === 0
        if (counter === 0) {

            // Scroll to the bounding space of the matching string and return
            counter = matchLen;
            console.log(counter, matchLen);
            document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${matchLen} matches`;
            ScrollTo(matches[counter-1]);
            return;
        };

        // Scroll to the bounding space of the matching string
        counter -= 1;
        document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${matchLen} matches`;
        ScrollTo(matches[counter]);
    });


    
    // document.getElementById('readerControlNext').addEventListener('click', () => {
        
    //     // Check counter, reset
    //     if (counter === Object.keys(matches).length - 1) {
    //         counter = 0;
    //     }
    //     else { counter+=1; };
    //     console.log(counter, Object.keys(matches).length);

    //     // Scroll to rect
    //     document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${Object.keys(matches).length} matches`;
    //     ScrollTo(matches[counter]);
    // });

    // document.getElementById('readerControlPrevious').addEventListener('click', () => {
        
    //     // Check counter, reset
    //     if (counter === 0) {
    //         counter = Object.keys(matches).length - 1;
    //     }
    //     else { counter-=1; };

    //     // Scroll to rect
    //     document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${Object.keys(matches).length} matches`;
    //     ScrollTo(matches[counter]);
    // });
};

// Configure reader controls
function configReader() {



};



// Configure debounce
let debounceTimer;
const debounce = (callback, time) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time);
};

// Retro-active event search (on key press it searches)
sb.addEventListener('keyup', async (event) => {

    // Turn on throbber
    if (event.code !== 'Enter' && event.code !== 'ShiftLeft' && event.code !== 'ControlLeft' && event.code !== 'CapsLock' && event.code !== 'Space') {
        document.getElementById('loadingSpinner').style.display = 'flex';
    };

    // Localised function
    async function search() {

        // Exclude modifier keys from event
        if (event.code !== 'Enter' && event.code !== 'ShiftLeft' && event.code !== 'ControlLeft' && event.code !== 'CapsLock' && event.code !== 'Space') {
            await searchByText(sb.value).then((data) => { // Fetch URL

                if (data) { // Ignore falsy return
                    parseResponse(data);
                };
            })
            .then(() => {
                document.getElementById('loadingSpinner').style.display = 'none';
            });
        };
    };

    // Use search as a callback on debounce function
    debounce(search, 500);
});