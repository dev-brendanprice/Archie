// Scroll window to pos via rect
export default function ScrollTo(DOMElement) {
    
    // Scroll (error catch)
    try {

        document.body.scrollTop = document.documentElement.scrollTop = 0; // Reset

        const rectPos = DOMElement.getBoundingClientRect().top;
        const offsetPos = rectPos - 400;
        window.scrollTo({ top: offsetPos, behavior: 'smooth' });
    }
    catch (e) {
        console.error(e);
    };
};