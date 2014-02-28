hDOM(function() {
	hDOM(document.body).addClass('hDOM is the boss man yeh');

	hDOM(document.body).removeClass('man yeh');

	// console.log(hDOM(document.body).hasClass(/man/g));
	// console.log(hDOM(document.body).hasClass(/hDOM/g));

	var clone = hDOM('ul.list li').clone();
	hDOM('ul.list').append(clone);

	hDOM.emitter.on('an_event', function() {
		console.log(arguments);
	});

	hDOM.emitter.emit('an_event', 'a property', { hello: 'world!' });

});