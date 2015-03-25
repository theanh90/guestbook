__author__ = 'buitheanh'

define([
		   "dojo/_base/declare",
		   "dojo/cookie",
		   "dojo/_base/lang",
		   "dojo/dom-style",
		   "dojo/on",
		   "dojo/_base/array",
		   "dojo/dom-construct",
		   "dijit/form/Textarea",
		   "dijit/form/ValidationTextBox",
		   "dijit/form/Button",
		   "dijit/form/Form",
		   "./_ViewBaseMixin",
		   "./GreetingWidget",
		   "../store/GreetingStore",
		   "dojo/text!./templates/GuestbookTemplate.html",
		   "dojo/domReady!"
	   ], function(declare, _cookie, lang, domStyle, on, array, contruct, textarea, textbox,
				   button, from, _ViewBaseMixin, GreetingWidget, storeApi, template){
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

			var url = "/api/guestbook/"+this.bookName+"/greeting/";
			var storeGet = new storeApi().requestApi(url);

			storeGet.query().then(lang.hitch(this, function(data){
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

			this.guestbookNameNode.innerHTML = "Guestbook: " + this.bookName;
			this.contentArea.set("value", "");
		},

		_submit: function(){
			var value = dijit.byId('addForm').get('value');
			var url = "/api/guestbook/"+value.book_name+"/greeting/";
			var data = {book_name: value.book_name, message: value.message};
			var storeSubmit = new storeApi().requestApi(url);
			storeSubmit.add(data).then(lang.hitch(this, function(data){
				this.bookName = value.book_name;
				this.loadGreeting();
			}), function(err){
				if(err.status){
					alert('Input data are invalid!!! \nPlease try again')
				}else{
						alert('ERROR: ' + err.status);
				}
			});

		}

	});

});
