__author__ = 'buitheanh'

define([
		   "dojo/_base/declare",
		   "dojo/cookie",
		   "dojo/request",
		   "dojo/store/JsonRest",
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
		   "./_ViewBaseMixin",
		   "./GreetingWidget",
		   "dojo/text!./templates/GuestbookTemplate.html",
		   "dojo/domReady!"
	   ], function(declare, _cookie, request, store, lang, domStyle, mouse, on, array, contruct, textarea, textbox,
				   button, from, _ViewBaseMixin, GreetingWidget, template){
	return declare("GuestbookWidget", [_ViewBaseMixin], {
		// Some default values for our author
		// These typically map to whatever you're passing to the constructor
		templateString: template,
		bookName: "de_name",

		postCreate: function(){
			this.inherited(arguments);
			this.loadGreeting();
			this.own(
				on(this.submitButton,"click", lang.hitch(this, "_submit")),
				on(this.changeButton,"click", lang.hitch(this, "_changeGuestbook"))
			);
		},

		_changeGuestbook:function(){
			var value = dijit.byId('addForm').get('value');
			this.bookName = value.book_name;
			this.loadGreeting();
		},

		_cleanGreeting: function(){
			// Destroy exist greetings
			dojo.query('.greetingWidget').forEach(function(node){
			   	dijit.byNode(node).destroyRecursive(true); // destroy ID
				contruct.destroy(node); //destroy innerHTML
			});
			this.greetingsContainerNode.innerHTML = "";
		},

		loadGreeting: function(){
			var node = this.greetingsContainerNode;
			this._cleanGreeting();

			request("/api/guestbook/"+this.bookName+"/greeting/", {
				handleAs: "json"
			}).then(lang.hitch(this, function(data){
				var domFrag = document.createDocumentFragment();
				if (JSON.stringify(data)!="{}"){
					array.forEach(data.greetings, lang.hitch(this, function(greeting){
						greeting.bookName = this.bookName;
						greeting.guestbookWidget = this;
						var greeWidget = new GreetingWidget(greeting);
						greeWidget.placeAt(domFrag);
					}));
					contruct.place(domFrag, node);
				}
				else{
					this.greetingsContainerNode.innerHTML = "This Guestbook is empty!!";
				}

			}));

			this.guestbookNameNode.innerHTML = "Guestbook name: " + this.bookName;
			this.contentArea.set("value", "");
		},

		_submit: function(){
			var value = dijit.byId('addForm').get('value');
			request.post("/api/guestbook/"+value.book_name+"/greeting/", {
				data: {
					book_name: value.book_name,
					message: value.message
				},
				headers: { "X-CSRFToken": _cookie('csrftoken') }
			}).then(lang.hitch(this, function(text){
				this.bookName = value.book_name;
				this.loadGreeting();
			}));

		}

	});

});
