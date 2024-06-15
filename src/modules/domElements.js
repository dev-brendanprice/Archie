// Assign and return DOM elements for global usage
export default function domElements() {

    const singleResultContainer = document.getElementById('singleResultContainer');
    const searchBarElement = document.getElementById('searchBarContainer');
    const resultsElement = document.getElementById('results');
    const footerElement = document.getElementById('footer');
    const searchBar = document.getElementById('sbar');

    return {
        singleResultContainer,
        searchBarElement,
        resultsElement,
        footerElement,
        searchBar
    };
};