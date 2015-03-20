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
		   "dojo/dom-construct",
		   "dijit/form/Textarea",
		   "dijit/form/ValidationTextBox",
		   "dijit/form/Button",
		   "dijit/form/Form",
		   "dijit/_WidgetsInTemplateMixin",
		   'dijit/_TemplatedMixin',
		   'dijit/_WidgetBase',
		   "guestbook/GreetingWidget",
		   "dojo/text!./views/templates/GuestbookTemplate.html"
	   ], function(declare, _cookie, request, lang, domStyle, mouse, on, array, contruct, textarea, textbox, button, from, _WidgetsInTemplateMixin, _TemplatedMixin,
				   _WidgetBase, GreetingWidget, template){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		// Some default values for our author
		// These typically map to whatever you're passing to the constructor
		templateString: template,
		baseClass: "guestbookWidget",
		bookName: "de_name",
		user: null,
		isAdmin: 0,

		postCreate: function(){
			this.inherited(arguments);
			var node = this.greetings;
			this.loadGreeting();
			this.own(
				on(this.submitButton,"click", lang.hitch(this, "_submit"))
			);

		},
		_cleanGreeting: function(){
			// Destroy exist greetings
			dojo.query('.greetingWidget').forEach(function(node){
			   	dijit.byNode(node).destroyRecursive(true); // destroy ID
				contruct.destroy(node); //destroy innerHTML
			});
		},

		loadGreeting: function(){
			var node = this.greetings;
			var thisObj = this;

			this._cleanGreeting();

			request("/api/guestbook/"+this.bookName+"/greeting/", {
				handleAs: "json"
			}).then(function(data){
				array.forEach(data.greetings, function(greeting){
					greeting.user = thisObj.user;
					greeting.isAdmin = thisObj.isAdmin;
					greeting.bookName = thisObj.bookName;
					greeting.guestbookWidget = thisObj;
					var greeWidget = new GreetingWidget(greeting);
					greeWidget.placeAt(node);
				});
			});
		},

		_submit: function(){
			var value = dijit.byId('myForm').get('value');
			request.post("/api/guestbook/"+value.book_name+"/greeting/", {
				data: {
					book_name: value.book_name,
					message: value.message
				},
				headers: { "X-CSRFToken": _cookie('csrftoken') }
			}).then(lang.hitch(this, function(text){
				this.bookName = value.book_name;
				this.loadGreeting();
				this.guestbook_name.innerHTML = "Guestbook name: " + this.bookName;
				this.contentArea.set("value", "");
			}));

		}

	});

});
