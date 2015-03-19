__author__ = 'buitheanh'

define([
		   "dojo/_base/declare",
			"dojo/cookie",
		   "dojo/request",
		   "dojo/_base/lang",
		   "dojo/dom-style",
		   "dojo/mouse",
		   "dojo/on",
		   "dojo/_base/array",
		   "dijit/form/Textarea",
		   "dijit/form/ValidationTextBox",
		   "dijit/form/Button",
			"dijit/form/Form",
		   "dijit/_WidgetsInTemplateMixin",
		   'dijit/_TemplatedMixin',
		   'dijit/_WidgetBase',
		   "guestbook/GreetingWidget",
		   "dojo/text!./views/templates/GuestbookTemplate.html"
	   ], function(declare, cookie, request, lang, domStyle, mouse, on, array, textarea, textbox, button, from, _WidgetsInTemplateMixin, _TemplatedMixin,
				   _WidgetBase, GreetingWidget, template){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		// Some default values for our author
		// These typically map to whatever you're passing to the constructor
		templateString: template,
		baseClass: "guestbookWidget",
		guestbookname: "de_name",

		postCreate: function(){
			this.inherited(arguments);
			var node = this.greetings;

			request("/api/guestbook/de_name/greeting/", {
				handleAs: "json"
			}).then(function(data){
				array.forEach(data.greetings, function(greeting){
					var greeWidget = new GreetingWidget(greeting);
					greeWidget.placeAt(node);
				});
			});
			this.own(
				on(this.submitButton,"click", lang.hitch(this, "_submit"))
			);
		},

		_submit: function(){
			var value = dijit.byId('myForm').get('value');
			console.log(value);
			request.post("api/guestbook/de_name/greeting/", {
				data: {
					book_name: "de_fault",
					message: "fasdf asdf asdf asdf"
				},
				headers: { "X-CSRFToken": "AzpjdaSTZXP5X0xM6xmB5JZwNIeYpXgO" }
			}).then(function(text){
				console.log("The server returned: ", text);
			});

		}

	});

});
