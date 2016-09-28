var app = {};

app.rooms = [];
app.friends = {};

var selectedValue, lastRetrieved;

app.send = message => { // pass in message object
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
    success: data => {
    },
    error: data => {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.renderMessage = message => {
  $('#chats').append('<div class="' + message.roomname + ' room">' + 
    '<a class="' + filterXSS(message.username) + '">' + 
    '<i class="fa fa-user-plus addFriend" aria-hidden="true"></i>' +
    '  @' + filterXSS(message.username) + '</a>' + ' ' + 
    '<span class="timeago">' + jQuery.timeago(message.createdAt) + '</span>' + '<br><span class="message">' +  
    filterXSS(message.text) + '</span>' + '  ' + '<input type="checkbox" name="checkboxG4" id="checkboxG4" class="css-checkbox"><label for="checkboxG4" class="css-label radGroup1 clr"></label></div>');
};

app.fetch = () => {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    data: {order: '-createdAt', limit: 10},
    contentType: 'application/json',
    success: data => {
      if (lastRetrieved) { // page has retrieved data before

        if (lastRetrieved === data.results[0].objectId) {
          // fully updated, dont do anything
        } else {
          let index;
          data.results.forEach(result => {
            if (result.objectId === lastRetrieved) {
              index = i; // attain index of last updated element
            }
          });

          // slice and prepend new stuff
          let newData = data.results.slice(0, index);

          //iterating from the end of the array and appending new chats
          for (let i = newData.length - 1; i >= 0; i--) {
            var message = newData[i];
            var location = $('#chats').find('div:last-child');
            var rendered = '<div class="' + message.roomname + ' room">' + 
              '<a class="' + filterXSS(message.username) + '">' + 
              '<i class="fa fa-user-plus addFriend" aria-hidden="true"></i>' +
              '  @' + filterXSS(message.username) + '</a>' + ' ' + 
              '<span class="timeago">' + jQuery.timeago(message.createdAt) + '</span>' + '<br><span class="message">' +  
              filterXSS(message.text) + '</span>' + '  ' + '<input type="checkbox" name="checkboxG4" id="checkboxG4" class="css-checkbox">'
              + '<label for="checkboxG4" class="css-label radGroup1 clr"></label></div>';

            $(rendered).hide().insertAfter(location).fadeIn(1000);
          }

          lastRetrieved = newData[0].objectId;
        }

      } else { // full update required (i.e. !lastRetrieved)
        lastRetrieved = data.results[0].objectId;

        app.clearMessages();
        app.clearRooms();

        for (var i = data.results.length - 1; i >= 0; i--) {
          var message = data.results[i];
          app.renderMessage(message);
          app.rooms.push(message.roomname);
        }

        app.renderRoom(app.rooms);
      }

      //save the name of the room last entered so that it does not get refreshed
      $('.roomselect')[0].selectize.setValue(selectedValue);

      //toggles class for the like button orange fill
      setTimeout(function() {
        $('.radGroup1').on('click', function() {
          $(this).toggleClass('chk');
        });

        $('.addFriend').on('click', function() {
          var friend = $(this).parent().closest('a').attr('class');
          app.addFriend(friend);
        });

        $('.removeFriend').on('click', function() {
          var friend = $(this).parent().closest('a').attr('class');
          app.removeFriend(friend);
        });
      }, 200);

      //upon clickin the icon, friend finds the parent div that has the username as a class
      //adds the friend name as a key-value pair to the friends object


      //controls scrollbar
      $('#chats').animate({scrollTop: 999999}, 2000);

    },
    error: data => {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};



app.clearRooms = () => {
  $('.selectpicker').empty();
};
app.clearMessages = () => {
  $('#chats').empty();
};

app.renderRoom = roomArray => {
  var rooms = [];
  //finding unique values in the rooms array
  _.uniq(roomArray).forEach(room => {
    rooms.push({text: room, value: room});
  });

  //applying the selectize class onto the dropdown menu.
  var selectize = $('.roomselect')[0].selectize;
 
  selectize.clear();
  selectize.clearOptions();

  rooms.forEach(room => {
    selectize.addOption(room);
  });
};


app.addFriend = friend => {
  //replaces the add friend icon with github icon
  $('.' + friend).find('i').replaceWith('<i class="fa fa-github-alt removeFriend" aria-hidden="true"></i>');
  //add friend to the friends object
  if (!app.friends.hasOwnProperty(friend) && friend !== undefined) {
    app.friends[friend] = friend;
  }

  app.updateFriendsList();
};

app.removeFriend = friend => {
  $('.' + friend).find('i').replaceWith('<i class="fa fa-user-plus addFriend" aria-hidden="true"></i>');
  delete app.friends[friend];
  
  app.updateFriendsList();
};

app.updateFriendsList = () => {
  //refreshes friends list on every fetch
  $('.friends').empty();
  
  for (var key in app.friends) {
    $('.friends').append('<div class="friend"><i class="fa fa-snapchat-ghost"></i>' + '    ' + app.friends[key] + '</div>');
  }
};

$(document).ready(function() {
  //updates immediately
  app.fetch();

  setInterval(function() {
    app.fetch();
  }, 10000);

  //runs the post ajax command on click or on enter
  $('.postmsg').on('keydown click', function(event) {
    if ((event.type === 'keydown' && event.keyCode === 13) || event.type === 'click') {
      event.preventDefault();
      app.send($('.inputmsg').val());
      $('.inputmsg').val('');
      app.fetch();
    }
  });

  //default settings for the dropdown menu
  $('.roomselect').selectize({
    create: true,
    sortField: 'text'
  });

  //dropdown menu
  $('.roomselect').change(function() {
    selectedValue = ($(this).val()) || selectedValue; // sticky fix!
    $('.room').hide();
    $('.' + selectedValue).show();
    // $('#chats').animate({scrollTop: 100000}, 2000);
  });

  $('#chats').animate({scrollTop: 100000}, 2000);
});
