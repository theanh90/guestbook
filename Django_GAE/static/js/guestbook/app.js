define([
	'dojo/dom',
	'dojo/_base/config',
	'dojo/_base/window',
	'dojo/parser',
	'dojo/ready',
	'./views/GuestbookWidget'
], function(dom, config, win, parser, ready, Guestbook) {
	ready(function() {
		if (!config.parseOnLoad) {
			parser.parse();
		}
		var view = new Guestbook(data),
			position = dom.byId("greeting");
		view.placeAt(position);
		view.startup();
	});
});
