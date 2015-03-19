__author__ = 'buitheanh'

define([
	"dojo/_base/declare",
	"dojo/request",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/mouse",
	"dojo/on",
	'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
	"dojo/text!./views/templates/GreetingTemplate.html"
	], function(declare, request, lang, domStyle, mouse, on, _TemplatedMixin, _WidgetBase, template){
	return declare([_WidgetBase, _TemplatedMixin], {
		// Some default values for our author
		// These typically map to whatever you're passing to the constructor

		templateString: template,
		baseClass: "greetingWidget",

		author: "Anonymous person",
		content: null,
		date: null,
		date_update: null,
		user_update: null,

		postCreate: function(){
			this.inherited(arguments);
		},

		_setAuthorAttr: function(data){
			if (data != "Anonymous person") {
				this._set('author', data.email);
				this.authorNode.innerHTML = data.email + " wrote: ";
			}
		},

		_setDate_updateAttr: function(data){
			if (data != null){
				domStyle.set(this.updateByNode, "display", "");
				domStyle.set(this.timeUpdateNode, "display", "");
			}
		}
    });

});
