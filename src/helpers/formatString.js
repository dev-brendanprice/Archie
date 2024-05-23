// Remove apostrophes and enforce titleCase
export default function formatString(str) {

    let splitStr = str.toLowerCase().split(' ');

    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    };

    splitStr = splitStr.join(' ');
    return splitStr.replace(/'/g, '');
};