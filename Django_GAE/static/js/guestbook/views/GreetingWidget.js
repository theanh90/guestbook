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
	'./_ViewBaseMixin',
	"dojo/text!./templates/GreetingTemplate.html",
	"dojo/_base/config"
	], function(declare, _cookie, request, lang, domStyle, mouse, on, InlineEditBox, Form, _ViewBaseMixin, template, config){
	return declare("GreetingWidget", [_ViewBaseMixin], {
		// Some default values for our author
		// These typically map to whatever you're passing to the constructor

		templateString: template,

		bookName: "",
		author: "Anonymous person",
		content: null,
		date: null,
		date_update: null,
		user_update: null,
		id: 0,

		postCreate: function(){
			this.inherited(arguments);
			if (config.isAdmin == 'True'){
				domStyle.set(this.modifyNode, "display", "");
				domStyle.set(this.deleteNode, "display", "");
			}
			else{
				if (this.author.identity == parseInt(config.user)){
					domStyle.set(this.modifyNode, "display", "");
				}
			}
			this.own(
				on(this.deleteNode, "click", lang.hitch(this, "_delete")),
				on(this.editNode, "click", lang.hitch(this, "_edit")),
				on(this.cancelButton, "click", lang.hitch(this, "_cancel")),
				on(this.saveButton, "click", lang.hitch(this, "_save"))
			);
		},

		startup: function(){
			this.inherited(arguments);
		},

		_save: function(data){
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
				this.guestbookWidget.loadGreeting();
			}));
		},

		_cancel: function(data){
			domStyle.set(this.editContainerNode, "display", "None");
		},

		_edit: function (data) {
			domStyle.set(this.editContainerNode, "display", "");
		},

		_delete: function(data){
			var greetingId = this.id;
			var bookName = this.bookName;
			request.del("/api/guestbook/" + bookName + "/greeting/" + greetingId, {
				headers: { "X-CSRFToken": _cookie('csrftoken') }
			}).then(lang.hitch(this, function(text){
				this.guestbookWidget.loadGreeting();
			}));
		},

		_setAuthorAttr: function(data){
			if (data != "Anonymous person") {
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