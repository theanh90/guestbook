__author__ = 'buitheanh'

define([
	"dojo/_base/declare",
	"dojo/cookie",
	"dojo/_base/fx",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/mouse",
	"dojo/on",
	"dijit/InlineEditBox",
	"dijit/form/Form",
	'./_ViewBaseMixin',
	"../store/GreetingStore",
	"dojo/text!./templates/GreetingTemplate.html",
	"dojo/_base/config"
	], function(declare, _cookie, baseFx, lang, domStyle, mouse, on, InlineEditBox, Form, _ViewBaseMixin, storeApi, template, config){
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

		// Colors for our background animation
        baseBackgroundColor: "#DDDDDD",
        mouseBackgroundColor: "#def",

		postCreate: function(){
			var domNode = this.domNode;

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
				on(this.saveButton, "click", lang.hitch(this, "_save")),
				on(domNode, mouse.enter, lang.hitch(this, "changeBackground", this.mouseBackgroundColor)),
				on(domNode, mouse.leave, lang.hitch(this, "changeBackground", this.baseBackgroundColor))
			);
		},

		changeBackground: function(newColor) {
			// If we have an animation, stop it
			if (this.mouseAnim) {
				this.mouseAnim.stop();
			}

			// Set up the new animation
			this.mouseAnim = baseFx.animateProperty({
				node: this.domNode,
				properties: {
					backgroundColor: newColor
				},
				onEnd: lang.hitch(this, function() {
					// Clean up our mouseAnim property
					this.mouseAnim = null;
				})
			}).play();
		},

		startup: function(){
			this.inherited(arguments);
		},

		_save: function(data){
			var idForm = "editForm" + this.id;
			var value = dijit.byId(idForm).get('value');

			var url = "/api/guestbook/"+this.bookName+"/greeting/";
			data = {book_name: this.bookName, message: value.message, id: this.id};
			var storeEdit = new storeApi().requestApi(url);
			storeEdit.put(data).then(lang.hitch(this, function(data){
				this.guestbookWidget.loadGreeting();
			}), function(err){
					if(err.status){
						alert('Input data are invalid!!! \nPlease try again')
					}else{
						alert('ERROR: ' + err.status);
					}

			});
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
			var url = "/api/guestbook/" + bookName + "/greeting/" + greetingId;

			var storeDelete = new storeApi().requestApi(url);
			storeDelete.remove().then(lang.hitch(this, function(text){
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