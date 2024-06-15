// Scroll window to pos via rect
export default function ScrollTo(DOMElement, count, matchLen) {
    
    // Scroll (error catch)
    try {

        const rectPos = DOMElement.getBoundingClientRect().top;
        const offsetPos = rectPos - 400;

        document.body.scrollTop = document.documentElement.scrollTop = 0; // Reset
        window.scrollTo({ "top": offsetPos });
    }
    catch (e) {
        console.error(e);
    };
};