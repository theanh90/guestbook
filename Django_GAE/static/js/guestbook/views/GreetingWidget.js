define([
		"dojo/_base/declare",
		"dojo/_base/config",
		"dojo/_base/fx",
		"dojo/_base/lang",
		"dojo/dom-style",
		"dojo/mouse",
		"dojo/on",
		"dojo/text!./templates/GreetingTemplate.html",
		"./_ViewBaseMixin",
		"dijit/form/ValidationTextBox",
		"dijit/form/Form",
		"dijit/InlineEditBox"
		], function(declare, config, baseFx, lang, domStyle, mouse, on, template, _ViewBaseMixin){
		return declare("GreetingWidget", [_ViewBaseMixin], {

			templateString: template,

			bookName: "",
			author: "Anonymous person",
			content: null,
			date: null,
			dateUpdate: null,
			userUpdate: null,
			id: 0,

			// Colors for our background animation
			baseBackgroundColor: "#DDDDDD",
			mouseBackgroundColor: "#def",

			postCreate: function(){
				var domNode = this.domNode;

				this.inherited(arguments);
				if (config.isAdmin == 'True'){
					domStyle.set(this.deleteNode, "display", "");
				}else if (this.author.identity != parseInt(config.user)){
					this.greeting.set('editing', 'false');
				}

				this.own(
					on(this.deleteNode, "click", lang.hitch(this, "_delete")),
					on(this.greeting, "change", lang.hitch(this, "_save"))

//					on(domNode, mouse.enter, lang.hitch(this, "changeBackground",
//														this.mouseBackgroundColor)),
//					on(domNode, mouse.leave, lang.hitch(this, "changeBackground",
//														this.baseBackgroundColor))
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

			_save: function(data){
				if(config.isAdmin == "True" || (config.user === this.author.identity)){
					var message = this.greeting.get('value');
					var data = {book_name: this.bookName, message: message, id: this.id};

					var deferred = this.guestbookWidget.store.putGreeting(this.bookName, data);
					deferred.then(lang.hitch(this, function(data){
						this.guestbookWidget.loadGreeting();
					}), function(err){
							if(err.status == 400){
								alert('Input data are invalid!!! \nPlease try again')
							}else{
								alert('ERROR: ' + err.status);
							}
					});
				}else{
					alert("Only Administrator or Owner have a permission to edit!!");
				}


			},

			_cancel: function(data){
				domStyle.set(this.editContainerNode, "display", "None");
			},

			_edit: function (data) {
				domStyle.set(this.editContainerNode, "display", "");
			},

			_delete: function(data){
				var deferred = this.guestbookWidget.store.delGreeting(this.bookName, this.id);
				deferred.then(lang.hitch(this, function(text){
					this.guestbookWidget.loadGreeting();
				}), function (err) {
					alert("Failed to delete greeting" + err);
				});
			},

			_setAuthorAttr: function(data){
				if (data != "Anonymous person") {
					this.author = data;
					this.authorNode.innerHTML = data.email;
				}
			},

			_setDateUpdateAttr: function(data){
				if (data != null){
					domStyle.set(this.updateByNode, "display", "");
					domStyle.set(this.timeUpdateNode, "display", "");
				}
			}
		});

});