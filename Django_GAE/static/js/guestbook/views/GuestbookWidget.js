define([
		"dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/cookie",
		"dojo/dom-style",
		"dojo/on",
		"dojo/dom-construct",
		"dojo/text!./templates/GuestbookTemplate.html",
		"./_ViewBaseMixin",
		"../store/GreetingStore",
		"./GreetingWidget",
		"dijit/form/Textarea",
		"dijit/form/ValidationTextBox",
		"dijit/form/Button",
		"dijit/form/Form",
		"dojo/domReady!"
		], function(declare, lang, array, _cookie, domStyle, on, contruct, template, _ViewBaseMixin,
					GreetingStore, GreetingWidget){
	return declare([_ViewBaseMixin], {

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
			this.bookName = this.guestbookName.get('value');
			this.loadGreeting();
		},

		_cleanGreeting: function(){
			// Destroy exist greetings
			dojo.query('.greetingWidget').forEach(function(node){
				dijit.byNode(node).destroyRecursive(true); // destroy ID
				contruct.destroy(node); // destroy innerHTML
			});
			this.greetingsContainerNode.innerHTML = "";
		},

		loadGreeting: function(){
			var node = this.greetingsContainerNode;
			this._cleanGreeting();

			var deferred = GreetingStore().getGreeting(this.bookName);
			deferred.then(lang.hitch(this, function(data){
				var domFrag = document.createDocumentFragment();
				if (data != null){
					array.forEach(data.greetings, lang.hitch(this, function(greeting){
						greeting.guestbookWidget = this;
						var greeWidget = new GreetingWidget(greeting);
						greeWidget.placeAt(domFrag);
						greeWidget.startup();
					}));
					contruct.place(domFrag, node);
				}
				else{
					this.greetingsContainerNode.innerHTML = "This Guestbook is empty!!";
				}
			}));

			this.guestbookNameNode.innerHTML = "Guestbook: " + this.bookName;
			this.greeting.set("value", "");
		},

		_submit: function(){
			var book_name = this.guestbookName.get('value');
			var message = this.greeting.get('value');
			var data = {book_name: book_name, message: message};

			var deferred = GreetingStore().putGreeting(book_name, data);
			deferred.then(lang.hitch(this, function(data){
				this.bookName = book_name;
				this.loadGreeting();
			}), function(err){
				if(err.status){
					alert('Input data is invalid!!! \nPlease try again')
				}else{
						alert('ERROR code: ' + err.status);
				}
			});

		}

	});

});
