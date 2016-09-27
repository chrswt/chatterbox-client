var app = {};

app.init = () => {

};

app.rooms = [];
app.friends = [];

var selectedValue, lastRetrieved;

app.send = (message) => { // pass in message object
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify({
      username: window.location.search.slice(10),
      text: message,
      roomname: selectedValue
    }),
    contentType: 'application/json',
    success: function (data) {
      // Success
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.renderMessage = (message) => {
  $('#chats').append('<div class="' + message.roomname + ' room">' + 
    '<a class="' + filterXSS(message.username) + '">' + 
    filterXSS(message.username) + '</a>' + '@' + 
    filterXSS(message.roomname) + ': ' + 
    filterXSS(message.text) +'<p class="timeago">' + 
    jQuery.timeago(message.createdAt) + '</p></div>');
};

app.fetch = () => {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    data: {order: '-createdAt', limit: 100},
    contentType: 'application/json',
    success: function (data) {
      if (lastRetrieved) { // page has retrieved data before

        if (lastRetrieved === data.results[0].objectId) {
          console.log('no new stuff');
          // fully updated, dont do anything
        } else {
          console.log('new stuff');
          var index;
          for (var i = 0; i < data.results.length; i++) {
            if (data.results[i].objectId === lastRetrieved) {
              index = i; // attain index of last updated element
            }
          }

          console.log(index);

          // slice and prepend new stuff
          var newData = data.results.slice(0, index);
          console.log(newData);
          for (var i = newData.length - 1; i >= 0; i--) {
            var message = newData[i];
            var rendered = '<div class="' + message.roomname + ' room">' + 
            '<a class="' + filterXSS(message.username) + '">' + 
            filterXSS(message.username) + '</a>' + '@' + 
            filterXSS(message.roomname) + ': ' + 
            filterXSS(message.text) + '<p class="timeago">' +
            jQuery.timeago(message.createdAt) + '</div>';
            var location = $('#chats').find('div:first-child');

            $(rendered).hide().insertBefore(location).fadeIn(1000);
          }

          lastRetrieved = newData[0].objectId;
        }

      } else { // full update required (i.e. !lastRetrieved)
        lastRetrieved = data.results[0].objectId;

        app.clearMessages();
        app.clearRooms();

        data.results.forEach(function(message) {
          app.renderMessage(message);
          app.rooms.push(message.roomname);
        });

        app.renderRoom(app.rooms);
      }

      $('a').on('click', function(e) {
        e.preventDefault();
        if (!_.contains(app.friends, this.className)) {
          app.friends.push(this.className);
        }
      });

      $('.roomselect')[0].selectize.setValue(selectedValue);
     
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.clearMessages = () => {
  $('.selectpicker').empty();
};
app.clearRooms = () => {
  $('#chats').empty();
};

app.renderRoom = function(roomArray) {
  var rooms = [];
  _.uniq(roomArray).forEach(function(room) {
    rooms.push({text: room, value: room});
  });

  var selectize = $('.roomselect')[0].selectize;
  selectize.clear();
  selectize.clearOptions();
  rooms.forEach(function(room) {
    selectize.addOption(room);
  });
};

app.handleUsernameClick = () => {

};

app.handleSubmit = () => {

};

$(document).ready(function() {
  app.fetch();

  $('.postmsg').on('keydown click', function(event) {
    if ((event.type === 'keydown' && event.keyCode === 13) || event.type === 'click') {
      event.preventDefault();
      app.send($('.inputmsg').val());
      $('.inputmsg').val('');
      app.fetch();
    }
  });

  $('.roomselect').selectize({
    create: true,
    sortField: 'text'
  });

  $('.roomselect').change(function() {
    selectedValue = ($(this).val()) || selectedValue; // sticky fix!
  });
});
