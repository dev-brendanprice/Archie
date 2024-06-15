import {clientLocale} from './config';
import {searchBarElement, resultsElement} from '../main';
import renderArticle from './renderArticle';

// Save and process the response
export default function parseResponse(data) {

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

        result.creationDate = new Date(result.creationDate).toLocaleDateString(clientLocale, dateOptions);
        result.modifyDate = new Date(result.modifyDate).toLocaleDateString(clientLocale, dateOptions);

        result.query = data.Response.query;
        return result;
    };
};