import { get, set } from 'idb-keyval';

export default function contentStack() {

    const url = 'https://graphql.contentstack.com/stacks/blte410e3b15535c144?environment=live';
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'access_token': 'cs7929311353379d90697fc0b6'
    };

    const searchString = 'Sunshot';
    const query = `
        query {
            articles: all_news_article(limit: 200) {
                items {
                    title
                    date
                    html_content
                }
                total
            }
        }
    `;

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            query: query
        })
    })
    .then(response => response.json())
    .then((data) => {

        console.log(data);
        data = data.data;
        data.articles.items.forEach(item => {
            console.log(item);
            set(item.title, item);
        });
    })
    .catch(error => console.error(error));
};