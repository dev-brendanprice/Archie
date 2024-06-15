import config from './modules/config';
import domElements from './modules/domElements';
import searchByText from './modules/searchByText';
import eventSearch from './modules/eventSearch';

// apply config settings
config();

// scroll fix
window.scrollTo(0,0);

// get DOM elements
export const {
    singleResultContainer,
    searchBarElement,
    resultsElement,
    footerElement,
    searchBar
} = domElements();

// fetch articles on keyup
eventSearch(searchBar, searchByText);