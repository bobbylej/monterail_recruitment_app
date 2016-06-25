WebModule.service('dateService', ['$http', function($http) {

  var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
  var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

	function dateDifference(date1, date2) {
    let difference = Math.abs(date1.getTime() - date2.getTime());
		let value = parseInt(difference/(1000*60*60*24));
		let meta = value > 1 ? 'days' : 'day';
		if(value < 1) {
			value = parseInt(difference/(1000*60*60));
			meta = value > 1 ? 'hours' : 'hour';
		}
		if(value < 1) {
			value = parseInt(difference/(1000*60));
			meta = value > 1 ? 'minutes' : 'minute';
		}
		if(value < 1) {
			value = parseInt(difference/(1000));
			meta = value > 1 ? 'seconds' : 'second';
		}

    return {
			value,
			meta
		};
	}

  function inWords(date) {
    if(date.meta === 'day' && date.value === 1)
      return {
        value: 'yesterday',
        meta: ''
      };
    let num = date.value;
    if ((num = num.toString()).length > 9)
      return date;
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n)
      return date;
    var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return {
      value: str,
      meta: date.meta
    };
  }

  return {
    dateDifference,
    inWords
  }

}]);
