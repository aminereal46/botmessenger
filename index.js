var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.get('/' , (req , res) => {
  res.send("hello world");
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "aminebot"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
});

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      if(webhook_event.message){
          receivedMessage(webhook_event)
      }
    });




    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }



});
function receivedMessage(event){
  var senderId = event.sender.id;
  var recipientId = event.recipient.id;
  var timeOfMessage = event.timestap;
  var message = event.message;
  var messageId=message.mid;
  var messageText = message.text;
  var messageAttachmens = message.attachments;

  if(messageText){
    switch(messageText){
      case 'generic':
        sendGenericMessage(senderId);
        break;
      default:
        sendTextMessage(senderId , messageText);
    }
  }
  else if(messageAttachments){
      sendTextMessage(senderId , "Message with attachments received");
  }
}


function sendTextMessage(recipientId , messageText){
  var messageData={
    recipient:{
      id: recipientId
    },
    message:{
      text:messageText
    }
  };
  callSendApi(messageData);
}

function callSendApi(messageData){
  console.log("arrived here")
   request({
     uri: "https://graph.facebook.com/v2.6/me/messages",
     qs: { "access_token": "EAACHkOkaZCMkBAIcBedn6cZANTlTmkONLLP6tcn47ZB9TGygaZBZAQVfcfQtTHf8BVry7g0aW2QDHwkt1jPxW883QZA8fZCELTMVzJ2JMtwvFJMl7jDXyZAYh3rxdZBslTHprdGytT8sWWZA4pht9AUnabnWyZBRcl3KmGVPq9DiKZAiCbU2J9tXEi1l" },
     method: "POST",
     json: messagesData
   }, (err, res, body) => {
   });
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Application served on port ' + port + '...');
});
