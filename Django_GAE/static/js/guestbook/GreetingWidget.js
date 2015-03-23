__author__ = 'buitheanh'

define([
	"dojo/_base/declare",
	"dojo/cookie",
	"dojo/request",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/mouse",
	"dojo/on",
	"dijit/InlineEditBox",
	"dijit/form/Form",
	'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./views/templates/GreetingTemplate.html"
	], function(declare, _cookie, request, lang, domStyle, mouse, on, InlineEditBox, Form, _TemplatedMixin, _WidgetBase,
				_WidgetsInTemplateMixin, template){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		// Some default values for our author
		// These typically map to whatever you're passing to the constructor

		templateString: template,
		baseClass: "greetingWidget",

		bookName: "",
		author: "Anonymous person",
		content: null,
		date: null,
		date_update: null,
		user_update: null,
		id: 0,
		user: null,
		isAdmin: 0,

		postCreate: function(){
			this.inherited(arguments);
			if (this.isAdmin){
				domStyle.set(this.modify, "display", "");
				domStyle.set(this.delete, "display", "");
			}
			else{
				if (this.author.identity == parseInt(this.user)){
					domStyle.set(this.modify, "display", "");
				}
			}
			this.own(
				on(this.delete, "click", lang.hitch(this, "_delete")),
				on(this.edit, "click", lang.hitch(this, "_edit")),
				on(this.CancelButton, "click", lang.hitch(this, "_cancel")),
				on(this.SaveButton, "click", lang.hitch(this, "_save"))
			);
		},

		_save: function(data){
			var thisObj = this;
			var idForm = "editForm" + this.id;
			var value = dijit.byId(idForm).get('value');
			request.put("/api/guestbook/"+this.bookName+"/greeting/"+this.id+"/", {
				data: {
					book_name: this.bookName,
					message: value.message
				},
				headers: { "X-CSRFToken": _cookie('csrftoken')
				},
				content_type: 'application/octet-stream'
			}).then(lang.hitch(this, function(text){
				thisObj.guestbookWidget.loadGreeting();
			}));
		},

		_cancel: function(data){
			domStyle.set(this.editDiv, "display", "None");
		},

		_edit: function (data) {
			domStyle.set(this.editDiv, "display", "");
		},

		_delete: function(data){
			var thisObj = this;
			var greetingId = this.id;
			var bookName = this.bookName;
			request.del("/api/guestbook/" + bookName + "/greeting/" + greetingId, {
				headers: { "X-CSRFToken": _cookie('csrftoken') }
			}).then(function(text){
				thisObj.guestbookWidget.loadGreeting();
			});
		},

		_setAuthorAttr: function(data){
			if (data != "Anonymous person") {
//				this._set('author', data.email);
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