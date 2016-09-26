// var message = {
//   username: 'Batman',
//   text: 'hello test test test',
//   roomname: 'lobby'
// };


var app = {};

app.init = () => {

};

app.rooms = [];

app.send = (message) => { // pass in message object
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify({
      username: window.location.search.slice(10),
      text: message,
      roomname: $('.selectpicker').val()
    }),
    contentType: 'application/json',
    success: function (data) {
      console.log(data);
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.renderMessage = (message) => {
  $('#chats').append('<div>' + filterXSS(message.username) + '@' + filterXSS(message.roomname) + ': ' + filterXSS(message.text) + '</div>');
};

app.fetch = () => {
  app.clearMessages();
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    data: {order: '-createdAt', limit: 100},
    contentType: 'application/json',
    success: function (data) {
      data.results.forEach(function(message) {
        app.renderMessage(message);
        app.rooms.push(message.roomname);
      });

      app.renderRoom(app.rooms);
     
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.clearMessages = () => {
  $('#chats').empty();
};

app.renderRoom = function(roomArray) {
  _.uniq(roomArray).forEach(function(room) {
    $('.selectpicker').append('<option>' + room + '</option>');
  });
};

app.handleUsernameClick = () => {

};

app.handleSubmit = () => {

};

$(document).ready(function() {
  app.fetch();

  $('.postmsg').on('click', function() {
    app.send($('.inputmsg').val());
  });
});

