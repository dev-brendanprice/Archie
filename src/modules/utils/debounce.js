// return debounce function on defined ms
export default function debounce (callback, time) {
    let debounceTimer;
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time);
};