define([
	'dojo/_base/config',
	'dojo/_base/window',
	'dojo/dom',
	'dojo/parser',
	'dojo/ready',
	'./views/GuestbookWidget'
], function(config, win, dom, parser, ready, GuestbookWidget) {
	ready(function() {
		if (!config.parseOnLoad) {
			parser.parse();
		}
		var view = new GuestbookWidget(data),
			position = dom.byId("guestbook");
		view.placeAt(position);
		view.startup();
	});
});
