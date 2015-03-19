__author__ = 'buitheanh'

define([
		   "dojo/_base/declare",
		   "dojo/request",
		   "dojo/_base/lang",
		   "dojo/dom-style",
		   "dojo/mouse",
		   "dojo/on",
		   "dojo/_base/array",
		   "dijit/form/Textarea",
		   "dijit/form/TextBox",
		   "dijit/_WidgetsInTemplateMixin",
		   'dijit/_TemplatedMixin',
		   'dijit/_WidgetBase',
		   "guestbook/GreetingWidget",
		   "dojo/text!./views/templates/GuestbookTemplate.html",
		   "dijit/form/Button"
	   ], function(declare, request, lang, domStyle, mouse, on, array, textarea, textbox, _WidgetsInTemplateMixin, _TemplatedMixin,
				   _WidgetBase, GreetingWidget, template, button){
	return declare([_WidgetBase, _TemplatedMixin], {
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
			console.log(this.submitButton);
			var handle = this.own(
				on(this.submitButton,"click", lang.hitch(this, "aaaa"))
			);
			console.log(handle);

		},

		buildRendering: function(){
			this.inherited(arguments);
			console.log("aaaaa");
			console.log(this.domNode);
		},

		aaaa: function(){
			console.log("clgt");
		}

	});

});
