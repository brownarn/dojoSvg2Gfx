define(['dojo/_base/declare',
			'require',
			"dojo/_base/lang",
			'dijit/_WidgetBase',
			'dijit/_TemplatedMixin',
			"dojox/gfx",
			"dojox/gfx/utils",
			'dojo/text!./resources/Icon.html'
], function(declare, require, lang, _WidgetBase, _TemplatedMixin, gfx, gfxUtils, template) {
	
	return declare(require.module.mid, [_WidgetBase, _TemplatedMixin], {

		templateString: template,
		
		baseClass: "icon",
		
		item: null,
		
		postCreate: function() {	
			this.deserialize({
				parentNode: this.gfxSvg, 
				height: this.item.cheight, 
				width: this.item.cwidth, 
				json: this.item.ciconjson
			}); 		
			this.inherited(arguments);
		},
		
		deserialize: function(args) {
			// summary: creating a gfx surface to place a deserialized group of shapes.
			this._surface = gfx.createSurface(args.parentNode, args.width, args.height); 
			this._surface.whenLoaded(lang.hitch(this, function() {
				this._group = gfxUtils.deserialize(this._surface, JSON.parse(args.json));
			}));
		}
	});
});
