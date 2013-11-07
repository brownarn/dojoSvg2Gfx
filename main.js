define(["dojo/_base/declare",
			"require",
			"dijit/_TemplatedMixin",
			"dijit/_WidgetBase",
			"dojo/_base/lang",
			"dojo/_base/array",
			"./IconContainer",
			"./Svg2Gfx",
			"dojo/dom",
			"dojo/on",
			"dojox/xml/DomParser",
			"dojox/gfx/utils",
			"dojo/text!./resources/Svg2GfxConverter.html"
], function(declare, require, _TemplatedMixin, _WidgetBase, lang, array, IconContainer, Svg2Gfx, dom, on, DomParser, gfxUtils, template) {
	
	return declare(require.module.mid, [_WidgetBase, _TemplatedMixin], {
		
		templateString : template,
		
		baseClass: "svg2Gfx",
		
		height: 500,
		width: 500,
		overflow: "hidden",
		
		postCreate : function() {
			on(dom.byId("drop_zone"), 'dragover', lang.hitch(this, function(evt) {
				this._handleDragOver(evt);
			}));
			
			on(dom.byId("drop_zone"), 'drop', lang.hitch(this, function(evt) {
				this._handleFileSelect(evt);
			}));
			
			on(dom.byId("files"), 'change', lang.hitch(this, function(evt) {
				this._handleFileSelect(evt);
			}));
			
			this.list.parentNode = "div#converter"
			
			this.iconContainer = new IconContainer({}, this.list);
			
			this.inherited(arguments);		
		},
		
		_handleFileSelect : function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;
			
			array.forEach(files, function(file) {
				var reader = new FileReader();
				reader.onload = lang.hitch(this, function(e) {
					this._readerOnLoad(e, file);
				});
				reader.readAsText(file);
			}, this);
		},

		_readerOnLoad: function(evt, file) {
			var name = file.name.split(".")[0];
			
			// uses the dojox/gfx DOM parser to parse the xml file creating a JavaScript object of the SVG
			var svgJS = DomParser.parse(evt.target.result); 
			
			var parser = new Svg2Gfx({height: this.height, width: this.width, overflow: this.overflow});
			
			// Parses the style nodes and converts the JavaScript SVG objects to GFX shapes
			parser.parse(svgJS); 	
					
			// Serializes the surfaces as a group and outputs as json. 
			var gfxJson = gfxUtils.toJson(parser._surface);
			
			var obj = {
				"ciconjson" : gfxJson,
				"ciconname" : name,
				"cicondescription" : "Icon",
				"cwidth" : parser.width,
				"cheight" : parser.height,
				"coverflow" : parser.overflow
			};
			
			this.iconContainer.add(obj);
		},
		
		_handleDragOver : function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			evt.dataTransfer.dropEffect = 'copy';
		}
	})
});
