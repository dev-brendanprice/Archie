import debounce from './utils/debounce';
import parseResponse from './parseResponse';

export default function eventSearch(searchBar, searchByText) {

    // Retro-active event search (on key press it searches)
    searchBar.addEventListener('keyup', (event) => {

        const keyupSanitized = event.code !== 'Enter' && event.code !== 'ShiftLeft' && event.code !== 'ControlLeft' && event.code !== 'CapsLock' && event.code !== 'Space' && event.code !== 'Backspace';

        // check for correct keyup, execute
        if (keyupSanitized) {

            // throbber
            document.getElementById('loadingSpinner').style.opacity = '0.5';
            
            // wrap search function in debounce
            debounce(async () => {

                searchByText(searchBar.value).then(data => {

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
};