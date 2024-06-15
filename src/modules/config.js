
export let clientLocale;
export let clientVersion;
export let bnetApiKey;
export let csDeliveryToken; // ..
export let csAccessToken; // ..

export default function config() {

    clientLocale = navigator.language.split('-')[0];
    clientVersion = import.meta.env.version;
    bnetApiKey = import.meta.env.bungieApiKey;
    
    document.getElementById('footerVersion').innerHTML = `${import.meta.env.version}`;
};