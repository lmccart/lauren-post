let firebaseConfig = {
  apiKey: "AIzaSyAVLtkdoS7BlXvgx0AoLDpHgR9364xnm7s",
  authDomain: "lauren-post.firebaseapp.com",
  databaseURL: "https://lauren-post.firebaseio.com",
  projectId: "lauren-post",
  storageBucket: "lauren-post.appspot.com",
  messagingSenderId: "275925104977",
  appId: "1:275925104977:web:ef9cf43c7a64ec64ab7b70"
};
firebase.initializeApp(firebaseConfig);
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(function(user) { if (user) init(); });
let db = firebase.firestore();

let loaded = false;


function init() {
  Webcam.set({
    // live preview size
    width: 1920,
    height: 1080,
    
    // final cropped size
    crop_width: 250,
    crop_height: 250,
    
    // format and quality
    image_format: 'png',
    jpeg_quality: 100
  });
  Webcam.attach( '#camera' );
  Webcam.on( 'load', () => { loaded = true; });
  $("#submit").click(upload);
  $(document).keypress(handleKey)
}

let nextClass = '';

function handleKey(e) {
  console.log(e.key)
  if (e.key === '1') {
    nextClass = 'selected1';
  }
  else if (e.key === '2') {
    nextClass = 'selected2';
  } else {
    nextClass = ''
  }
}

takeSnapshot = () => {
  if (!loaded) return;
  Webcam.snap( function(dataURI) {
    let elt = $('<img src="'+dataURI+'"/>');
    $('#results').append(elt);
    elt.click((e) => {
      if (nextClass) {
        if (nextClass == 'selected1') {
          $('.selected1').removeClass();
          $(e.target).addClass('selected1');
        }
        else if (nextClass == 'selected2') {
          $('.selected2').removeClass();
          $(e.target).addClass('selected2');
        }
      }
    })
  } );
}
setInterval(takeSnapshot, 3000);

upload = () => {  
  let address = {
    recipient: $('#recipient').val(),
    primary_line: $('#street').val(),
    zip_code: $('#zip').val()
  }
  let color = $('#color').val();

  let message = $('#message').val();

  if (!address.recipient.length || !address.primary_line.length || !address.zip_code.length || !message.length || !color.length || $('.selected1').length < 1 || $('.selected2').length < 1) {
    console.log('missing data');
    return;
  }


  let dataURI0 =  $('.selected1').get(0).getAttribute('src');
  let dataURI1 =  $('.selected2').get(0).getAttribute('src');
  let file0 = new Blob([convertDataURIToBinary(dataURI0)], { type: 'image/png' });
  let file1 = new Blob([convertDataURIToBinary(dataURI1)], { type: 'image/png' });

  let storageRef = firebase.storage().ref();
  let urls = [];
  
  let image0Ref = storageRef.child(new Date().getTime()+'.png');
  image0Ref.put(file0).then(function(snapshot) {
    snapshot.ref.getDownloadURL().then(function(downloadURL1) {
      console.log('File available at', downloadURL1);
      urls.push(downloadURL1);

      let image1Ref = storageRef.child(new Date().getTime()+'.png');
      image1Ref.put(file1).then(function(snapshot) {
        snapshot.ref.getDownloadURL().then(function(downloadURL2) {
          console.log('File available at', downloadURL2);
          urls.push(downloadURL2);

          createPostcard({address: address, message: message, urls: urls, color: color});
        });
      });
    });
  });
};

createPostcard = (data) => {
  console.log(data)
  $.ajax(
  {
    type: 'POST',
    url: 'http://localhost:5001/lauren-post/us-central1/postcard',
    data: data,
    error: (res) => { console.log(res); },
    success: (res) => { console.log(res); }
  });
    
}

convertDataURIToBinary = (dataURI) => {
  const BASE64_MARKER = ';base64,';
  let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  let base64 = dataURI.substring(base64Index);
  let raw = window.atob(base64);
  let rawLength = raw.length;
  let array = new Uint8Array(rawLength);

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
};
