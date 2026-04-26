import fs from 'fs';
import https from 'https';

const searchAndDownload = async (query, filename) => {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&page=1&per_page=1`;
  
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if(json.results && json.results.length > 0) {
          const imgUrl = json.results[0].urls.raw + '&w=1600&h=900&fit=crop';
          https.get(imgUrl, (res2) => {
            if (res2.statusCode === 301 || res2.statusCode === 302) {
              https.get(res2.headers.location, (res3) => {
                 const file = fs.createWriteStream(filename);
                 res3.pipe(file);
              });
            } else {
              const file = fs.createWriteStream(filename);
              res2.pipe(file);
            }
          });
        } else {
             console.log('No results for', query);
        }
      } catch (e) {
          console.log('Error parsing JSON for', query, e.message);
      }
    });
  }).on('error', (e) => {
      console.log('Error fetching', query, e.message);
  });
};

searchAndDownload('Land Rover Defender front', 'public/cars/defender_main.jpg');
searchAndDownload('Land Rover Defender back side', 'public/cars/defender_side.jpg');
searchAndDownload('Land Rover Defender interior', 'public/cars/defender_interior.jpg');

searchAndDownload('Lamborghini Aventador SVJ front', 'public/cars/svj_main.jpg');
searchAndDownload('Lamborghini Aventador SVJ side', 'public/cars/svj_side.jpg');
searchAndDownload('Lamborghini Aventador interior', 'public/cars/svj_interior.jpg');

console.log('Fetching realistic images...');
