
$.fn.inputLabel = function() {
  let label = this.parent().find(`label[for="${this.attr('id')}"]`).detach();
  this.wrap('<div class="input-container"/>');
  this.after(label);
  this.on('change keyup paste', () => {
    if(this.val() != '') {
      label.addClass('invisible');
    }
    else {
      label.removeClass('invisible');
    }
  })
}

$.fn.radio = function() {
  let label = this.parent().find(`label[for="${this.attr('id')}"]`).detach();
  this.wrap('<div class="input-radio"/>');
  this.after(label);
  let radio = $('<span class="radio"/>').click(() => {
    this.click();
  });
  this.after(radio);
}
