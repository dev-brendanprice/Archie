import scrollTo from "./utils/scrollTo";

// Configure and render DOM elements for reader controls
export default function configReaderControls(query) {

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
            scrollTo(matches[counter-1], counter, matchLen);
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
        scrollTo(matches[counter], counter, matchLen);
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
            scrollTo(matches[counter-1]);
            return;
        };

        // Scroll to the bounding space of the matching string
        counter -= 1;
        document.getElementById('readerControlReferenceTag').innerHTML = `${counter} of ${matchLen} matches`;
        scrollTo(matches[counter]);
    });
};
