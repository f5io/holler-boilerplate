(function() {
	if (!('localStorage' in window) || window.localStorage === null) return;
	var _id = window.localStorage.getItem('_logID'), logUA = false;
	if (!_id) {
		_id = (new Date().getMilliseconds() * Math.random()).toString(36).substr(4, 7);
		window.localStorage.setItem('_logID', _id);
		logUA = true;
	} 
	var oldFn = console.log;
	var newFn = function() {
		var obj = { _id : _id, messages : [] },
			args = [].slice.call(arguments);
		obj.messages = args;
		var img = new Image();
		img.src = 'http://146.185.175.199:1337/log.gif?message=' + encodeURIComponent(JSON.stringify(obj));
		oldFn.apply(console, args);
	}
	console.log = newFn;
	if (logUA) console.log(navigator.userAgent);
})();



hDOM(function() {
	hDOM(document.body).addClass('hDOM is the boss man yeh');

	hDOM(document.body).removeClass('man yeh');

	// console.log(hDOM(document.body).hasClass(/man/g));
	// console.log(hDOM(document.body).hasClass(/hDOM/g));

	var clone = hDOM('ul.list li').clone();
	hDOM('ul.list').append(clone);

	hDOM.emitter.on('an_event', function() {
		console.log.apply(console, arguments);
	});

	hDOM.emitter.emit('an_event', 'a property', { hello: 'world!' });
});