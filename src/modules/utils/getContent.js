import {clientLocale,bnetApiKey} from '../config';

// Fetch content via contentId from bnet api
export default async function getContentById(contentId, locale) {
    
    // get responses in error catch
    try {

        // request config
        let url = `https://www.bungie.net/Platform/Content/GetContentById/${contentId}/${clientLocale}/`;
        let config = {
            method: "GET",
            headers: {
                "X-API-Key": bnetApiKey
            }
        };

        // request
        let response = await fetch(url, config).catch((error) => {
            console.error(error);
        });

        // lazy fix to ignore mismatch origin
        if (response.ErrorCode !== 2107) {
            return response;
        };
    }
    catch (e) {
        console.error(e);
    };
};