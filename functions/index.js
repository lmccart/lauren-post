const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
// const Lob = require('lob')('test_d5276e9de3aaf7ff5144350495c32905c09'); // test
const Lob = require('lob')('live_06caea8dfd78a1b1571f6f1e0970c85d287'); // live

const fs = require('fs');
const frontHtml = fs.readFileSync(`${__dirname}/postcard_front.html`, { encoding: 'utf-8' });
const backHtml = fs.readFileSync(`${__dirname}/postcard_back.html`, { encoding: 'utf-8' });

// Lob.addresses.list((err, body) => {
//   if (err) console.log(err);
//   else console.log(body.data);
//   let address = {
//     recipient: body.data[0].name,
//     primary_line: body.data[0].address_line1,
//     zip_code: body.data[0].address_zip,
//   }
//   createPostcard(address);
// });

let d = new Date();
const createPostcard = (address, message, urls, color) => {
  console.log(address)
  Lob.usVerifications.verify(address)
  .then(verifiedAddress => {
    console.log(verifiedAddress)
    Lob.postcards.create({
      to: {
        name: verifiedAddress.recipient,
        address_line1: String(verifiedAddress.primary_line),
        address_line2: verifiedAddress.secondary_line,
        address_city: verifiedAddress.components.city,
        address_state: verifiedAddress.components.state,
        address_zip: verifiedAddress.components.zip_code,
        address_country: 'US'
      },
      from: {
        name: 'Lauren Lee McCarthy',
        address_line1: '11811 Culver Blvd',
        address_line2: 'Apt 409',
        address_city: 'Los Angeles',
        address_state: 'CA',
        address_zip: '90066',
        address_country: 'US'
      },
      size: '4x6',
      front: frontHtml,
      back: backHtml,
      merge_variables: {
        name: verifiedAddress.recipient,
        message: message,
        url0: urls[0],
        url1: urls[1],
        background_color: color,
        date: (d.getMonth()+1)+'/'+d.getDate()+'/'+String(d.getFullYear()).substring(2)+' '+d.getHours()+':'+d.getMinutes()
      },
      metadata: {
        name: 'lauren_post',
        campaign_id: 'lauren_post'
      }
    }, (err, postcard) => {
      if (err) {
        console.log(err);
      }
      if (postcard) {
        console.log(`Postcard to ${postcard.to.name} sent! View it here: ${postcard.url}`);

      }
      console.log('success')
      console.log(postcard)
    });
  });
}

exports.postcard = functions.https.onRequest((req, res) => {

  res.set('Access-Control-Allow-Origin', '*');

  createPostcard(req.body.address, req.body.message, req.body.urls, req.body.color);
  res.send('Hello World!');
  // cors(req, res, () => {
    
  //   res.set({ 'Access-Control-Allow-Origin': '*' }).sendStatus(200)
  //   createPostcard(req.body.address, req.body.message, req.body.urls);
    
  // })
});