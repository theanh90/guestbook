define([
		"dojo/_base/declare",
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/store/JsonRest",
		"dojo/cookie"
	   ], function(declare, array, lang, store, _cookie){
	return declare([], {

		getGreeting:function(guestbook){
			var url = "/api/guestbook/"+guestbook+"/greeting/";
			var storeJson = new store({
				target: url
			});
			return storeJson.query();
		},

		putGreeting:function(guestbook, data){
			var url = "/api/guestbook/"+guestbook+"/greeting/";
			var storeJson = new store({
				target: url,
				headers: { "X-CSRFToken": _cookie('csrftoken') }
			});
			return storeJson.put(data);
		},

		delGreeting:function(guestbook, id){
			var url = "/api/guestbook/"+guestbook+"/greeting/"+id;
			var storeJson = new store({
				target: url,
				headers: { "X-CSRFToken": _cookie('csrftoken') }
			});
			return storeJson.remove();
		}

	});
});