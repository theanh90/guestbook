define([
		"dojo/_base/declare",
		"dojo/store/JsonRest",
		"dojo/cookie",
		"dojo/Stateful"
	   ], function(declare, JsonRest, cookie, Stateful){
	return declare([Stateful], {

		storeJson: null,
		guestbook: "",

		_guestbookGetter: function() {
			return this.guestbook;
		},

		_guestbookSetter: function(value) {
			this.guestbook = value;
		},

		constructor: function(){
			this.inherited(arguments);

			this.watch("guestbook", function(name, oldValue, value){
				if(oldValue != value){
					var url = "/api/guestbook/"+value+"/greeting/";
					this.storeJson = new JsonRest({
						target: url,
						headers: { "X-CSRFToken": cookie('csrftoken') }
											   });
				}
			});
		},

		getGreeting: function(guestbook){
			this.set("guestbook", guestbook);
			return this.storeJson.query();
		},

		putGreeting: function(guestbook, data){
			this.set("guestbook", guestbook);
			return this.storeJson.put(data);
		},

		delGreeting: function(guestbook, id){
			this.set("guestbook", guestbook);
			return this.storeJson.remove(id);
		}

	});
});