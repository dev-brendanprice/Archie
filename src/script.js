import ScrollTo from './helpers/scrollTo';
import getContent from './helpers/getContent';

// Script config (random stuff)
window.scrollTo(0, 0); // Lazy load-scroll fix (doesn't work lol)
let locale = navigator.language.split('-')[0];
let sb = document.getElementById('sbar');
document.getElementById('footerVersion').innerHTML = `${import.meta.env.version}`;

// Global DOMElement variables because why not
const singleResultContainer = document.getElementById('singleResultContainer');
const searchBarElement = document.getElementById('searchBarContainer');
const resultsElement = document.getElementById('results');
const footerElement = document.getElementById('footer');


// Fetch articles via searchText
async function searchByText(searchText) {

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


// Save and process the response
function parseResponse(data) {

    // Make array of results
    const resultsArray = data.Response.results.map(v => v);

    // Change DOM content
    resultsElement.innerHTML = '';
    resultsElement.style.display = 'block';
    searchBarElement.classList = 'sbarContainer_active';

    // Loop over array of results and append results to list
    let index = 0;
    for (let result of resultsArray) {
        
        const newElement = document.createElement('div');
        newElement.innerHTML = result.properties.Title;
        newElement.setAttribute('data-index', index);

        result = ammendResult(data, result);
        console.log(result)
        newElement.addEventListener('click', () => renderArticle(newElement, result));
        resultsElement.appendChild(newElement);
        index++;
    };

    // ammend content, ease of use
    function ammendResult(data, result) {

        const dateOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        result.creationDate = new Date(result.creationDate).toLocaleDateString(locale, dateOptions);
        result.modifyDate = new Date(result.modifyDate).toLocaleDateString(locale, dateOptions);

        result.query = data.Response.query;
        return result;
    };
};


// Read attribute from element onclick
async function renderArticle(element, result) {

    // change DOM content
    footerElement.style.display = 'none';
    singleResultContainer.style.display = 'block';

    // regex to highlight search query
    const searchQuery = result.query.searchText;
    const regex_highlight = new RegExp(searchQuery, 'gi');
    let content = result.properties.Content.replace(/(<mark class="highlight">|<\/mark>)/gim, '')

    // missing content
    const regex_missingContent = /\[\[([^\[\]]+)\]\]/g;
    const matches = content.match(regex_missingContent);
    const uniqueMatches = [];

    // check if text actually contains missing content
    if (matches) matches.forEach(item => uniqueMatches.push(item));
    let missingContent = {};
    
    // Wrap in promise
    let promise = new Promise(async (resolve, reject) => {

        // error handle, loop over array of missing content
        try {
            for (const item of matches) {
            
                // Get content id and request path of missing content, form new URL for image
                const contentId = item.split("'")[1];
                let newElement = '';
                
                await getContent(contentId, locale).then(data => {return data.json()})
                .then(value => {

                    // check if URL is not image
                    let path = value.Response.properties.Path;
                    if (path.includes('youtube')) {
                        newElement = `<iframe src="https://youtube.com/embed/${path.split('=')[1].substring(0, 11)}"></iframe>`;
                        return;
                    };

                    newElement = `<img class="articleImage" src="https://bungie.net${path}"/>`;
                });
    
                // Form new object with all ids and content to replace with
                missingContent[contentId] = { match: item, replaceWith: newElement };
            };

            // Loop over missing content object that was returned from above, replace in raw text
            for (let item of Object.values(missingContent)) {
                content = content.replace(`${item.match}`, `${item.replaceWith}`);
            };
    
            resolve();

        } catch (error) { reject(error); };
    });

    // Wait for promise to finish, then re-render text content
    promise.then(() => {

        console.log('Content fetched');

        // Re-render text
        document.getElementById('mid').style.display = 'none';
        document.getElementById('titleresult').innerHTML = `${element.innerHTML}`;
        document.getElementById('singleresult').innerHTML = content.replace(regex_highlight, '<mark class="highlight">$&</mark>');

        renderReaderControls(searchQuery); // Enable reader controls
    });

    // Render text, gets replaced by above promise call
    document.getElementById('mid').style.display = 'none';
    document.getElementById('titleresult').innerHTML = `${element.innerHTML}`;
    document.getElementById('singleresult').innerHTML = content.replace(regex_highlight, '<mark class="highlight">$&</mark>');
};


// Configure and render DOM elements for reader controls
function renderReaderControls(query) {

    // Find matches of search term in content
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
            ScrollTo(matches[counter-1], counter, matchLen);
            // console.log(counter, matchLen);
            return;
        };

        // Check if counter will surpass the length of the matches array, if so reset to 0
        if (counter === matchLen) {
            counter = 0;
        }
        else { counter += 1; }; // Increment the counter

        // Scroll to the bounding space of the matching string
        document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${matchLen} matches`;
        ScrollTo(matches[counter], counter, matchLen);
        // console.log(counter, matchLen);
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
};


// Debounce function
let debounceTimer;
function debounce (callback, time) {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time);
};

// Retro-active event search (on key press it searches)
sb.addEventListener('keyup', (event) => {

    const keyupSanitized = event.code !== 'Enter' && event.code !== 'ShiftLeft' && event.code !== 'ControlLeft' && event.code !== 'CapsLock' && event.code !== 'Space' && event.code !== 'Backspace';

    // check for correct keyup, execute
    if (keyupSanitized) {

        // throbber
        document.getElementById('loadingSpinner').style.opacity = '0.5';
        
        // wrap search function in debounce
        debounce(async () => {
            searchByText(sb.value).then(data => {

                let results = data.Response.results;
                if (results.length) {
                    document.getElementById('noResultsFoundText').style.display = 'none';
                    parseResponse(data);
                    return;
                };
    
                document.getElementById('noResultsFoundText').style.display = 'block';
            }).then(() => document.getElementById('loadingSpinner').style.opacity = '0');
        }, 500);
    };
});