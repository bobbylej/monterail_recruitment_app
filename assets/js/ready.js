$(document).ready(function() {

  $('#user-close-button').click(() => {
    $('#navbar .user-navbar').removeClass('show');
    $('#modal-blanket').fadeOut();
  })

  $('#modal-blanket').click(() => {
    $('#navbar .user-navbar').removeClass('show');
    $('#modal-user').removeClass('show');
    $('#modal-question').removeClass('show');
    $('#modal-blanket').fadeOut();
  })

  // config the navbar on scroll
  var prev = $(window).scrollTop();
  $(window).on('scroll', function(event) {
    let now = $(this).scrollTop();
    let difference = prev - now;
    let top = $('#navbar').position().top;
    let height = $('#navbar').height();
    let newPosition = top + difference;
    if(newPosition > height*(-1) && newPosition < 0) {
      $('#navbar').css('top', newPosition + 'px');
    }
    else if(newPosition <= height*(-1)) {
      $('#navbar').css('top', height*(-1) + 'px');
    }
    else if(newPosition > 0) {
      $('#navbar').css('top', 0 + 'px');
    }
    prev = now;
  });

});
