__author__ = 'buitheanh'

define([
		"dojo/_base/declare",
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/store/JsonRest",
		"dojo/cookie"
	   ], function(declare, array, lang, store, _cookie){
	return declare([], {

		requestApi:function(url){
			var storeJson = new store({
				target: url,
				headers: { "X-CSRFToken": _cookie('csrftoken') }
			});
			return storeJson;

		}

	});
});