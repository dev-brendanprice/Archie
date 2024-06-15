import { singleResultContainer, footerElement } from "../main";
import getContent from './utils/getContent';
import {clientLocale} from './config';
import renderReaderControls from './configReaderControls';

// Read attribute from element onclick
export default async function renderArticle(element, result) {

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
                
                await getContent(contentId, clientLocale).then(data => {return data.json()})
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