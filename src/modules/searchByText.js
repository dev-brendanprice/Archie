import {clientLocale,bnetApiKey} from './config';

// Fetch articles via searchText (DEPRECATE SOON, REPLACE WITH GRAPHQL)
export default async function searchByText(searchQuery) {

    // Set config
    let url = `https://www.bungie.net/Platform/Content/Search/${clientLocale}/?searchtext=${searchQuery}&ctype=help news`;
    let config = {
        method: "GET",
        headers: {
            "X-API-Key": bnetApiKey
        }
    };
    
    // Do request
    let response = await fetch(url, config).catch((error) => {
        console.error(error);
    });
    
    // Ignore mismatched origin (lazy fix) and empty field
    if (searchQuery !== '' && response.ErrorCode !== 2107) {
        return response.json();
    };
};