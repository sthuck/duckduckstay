import Chance from 'chance';
export interface SearchResult {
  url: string;
  title: string;
  screenshotUrl: string;
  snippets: string[];
}

// const chance = new Chance();
// export const search = (term: string) => {
//   console.log('searching for term', term);
//   return new Promise<SearchResult[]>(resolve => {
//     const data: SearchResult[] = new Array(chance.integer({min: 1, max: 20})).fill(0).map(() => ({
//       url: chance.url(),
//       title: chance.sentence({words: 4}),
//       screenshotUrl: 'https://www.wholewhale.com/wp-content/uploads/2013/11/pp-website-thumbnail.png',
//       snippets: new Array(3).fill(0).map(() => chance.paragraph()),
//     }));
//     setTimeout(() => resolve(data), 2000);
//   });
// };

export const search = (term: string) => {
  return fetch(`http://duckduckwebapp-env.eba-ypuyz5i6.us-east-1.elasticbeanstalk.com/api/search?search=${term}`)
    .then(r => r.json());
};