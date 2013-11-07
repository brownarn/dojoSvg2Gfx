define([
	'dojo/_base/declare',
	'require',
	'dijit/_TemplatedMixin',
	'dijit/layout/_LayoutWidget',
	'./Icon',
	'dojo/text!./resources/IconContainer.html'
], function(declare, require, _TemplatedMixin, _LayoutWidget, Icon, template) {
 
	return declare(require.module.mid, [_LayoutWidget, _TemplatedMixin], {

		templateString: template,
		
		baseClass: "iconContainer",
		
		add : function(object) {
			var icon = new Icon({
				item : object
			});
			this.addChild(icon);
		}
	});
});
