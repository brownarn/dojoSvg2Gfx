define(['dojo/_base/declare',
	'require', 
	'dojox/gfx', 
	'dojox/gfx/utils', 
	'dojox/gfx/matrix', 
	'dojo/_base/lang', 
	'dojo/dom-construct', 
	'dojo/_base/array', 
	'dojo/_base/Color'
], function(declare, require, gfx, gfxUtils, gfxMatrix, lang, construct, array, Color) {
	
	return declare(require.module.mid, null, {
		//   summary:
		//	This utility converts an svg xml to dojox gfx shapes.
		//	It further parses the group and style nodes output from the output of the dojox/xml/DomParser utility.
		//			
		//	To extend this parser:
		//		1. Read the SVG spec: http://www.w3.org/TR/SVG/expanded-toc.html
		//		2. Create properties to be added from the svg spec that are in the xml input
		//		3. Add properties to the shape object if necessary 
		//		4. Create a parser to handle your shape if one doesn't exist, and map the properties
		//		5. Modify the rendering bridge (e.g. svg.js) to handle the new properties
		//		6. Modify the utils serialize and deserialize if necessary to handle the new properties
		//		7. Create patch files for any changes to the dojox gfx _base, svg, shape, or utils.
		
		surface : null,
		height : null,
		width : null,
		overflow : null,
		_defs : null, 
		_surface : null,
		
		constructor: function(args) {
			this._defs = {};

			this.height = args.height;
			this.width = args.width;
			this.overflow = args.overflow;
			
			if (args.surface) {
				this.surface = args.surface;
			} else {
				this.surface = construct.create("div");
			}
			this._surface = gfx.svg.createSurface(this.surface, this.width, this.height);
		},

		parse: function(obj, group) {
			if (obj.nodeName == "svg") {
				if (obj.attributes instanceof Array) {
					array.forEach(obj.attributes, function(attr) {
						var nodeName = attr.nodeName.replace("-", "").replace(":", "");
						obj[nodeName] = attr.nodeValue;	
					}, this);		
							
					// Modifying height and width from default if values available in svg node
					if (obj.viewBox )	 {
						var vb = obj.viewBox.split(" ");
						this.height = vb[3];
						this.width = vb[2];
					} else if (!obj.viewBox && obj.height && obj.height !== "100%" && obj.width && obj.width !== "100%") {
						this.height = obj.height;
						this.width = obj.width;
					}
					
					if (obj.overflow) {
						this.overflow = obj.overflow;
					} 		
					delete obj.attributes;
				}
			}

			// Create group
			if (obj.nodeName === "g") {
				var group;
				if (obj.group) {
					group = obj.group.createGroup();
				} else {
					group = this._surface.createGroup();
				}
				obj.group = group;
			}
			
			if (obj.attributes instanceof Array) {
				array.forEach(obj.attributes, function(attr) {
					var nodeName = attr.nodeName.replace("-", "").replace("-", "").replace(":", ""); // Removes up to two dashes			
					if (nodeName === "style") {
						var nvps = attr.nodeValue.split(";");
						array.forEach(nvps, function(nvp) {
							var a = nvp.split(":");
							a[0] = a[0].replace("-", "").replace("-", "").replace(":", "");
							obj[a[0]] = a[1];
						}, this);
						
					} else {
						obj[nodeName] = attr.nodeValue;
					}
				}, this);		
				delete obj.attributes;	
			}

			// If the node has children; parse each child node
			if (obj.childNodes instanceof Array) {
				array.forEach(obj.childNodes, function(node) {
					if (node.nodeName != "#text") {
						if (obj.nodeName == 'g') { // Is the parent a group?
							node.group = obj.group;
						}
						var coll = node.nodeName.replace("-", "").replace(":", "").replace("#", "") + "s";
						// Make an obj for holding collections (e.g. color stops)
						if (obj[coll]) {
							obj[coll].push(node);
						} else {
							obj[coll] = [];
							obj[coll].push(node);
						}
						this.parse(node);
					}
					if (node.nodeName == "#text" && obj.nodeName == "tspan") {
						obj.parentNode.text = node.nodeValue;  // Setting the text attribute of a Text shape
					}		
				}, this);
				delete obj.childNodes;
			}

			// After children's attrs are parsed set extraRawNodeAttrs
			if (obj.nodeName == "g") {
				if (obj.id) {
					obj.group.setRawNodeAttr("id", obj.id);
				}
				if (obj.inkscapelabel) {
					obj.group.setRawNodeAttr("label", obj.inkscapelabel);
				}
				if (obj.display) {  // Initializes layers display atttribute
					obj.group.setRawNodeAttr("display", obj.display);
				}
				if (obj.transform) {
					obj.group.setTransform(gfxMatrix);
					obj.group.applyTransform(this._parseTransformation(obj.transform));
				}
				// if (obj.fill) {
					// obj.group.setRawNodeAttr("fill", obj.fill);
				// }
				// if (obj.fillopacity) {
					// obj.group.setRawNodeAttr("fill-opacity", obj.fillopacity);
				// }
				// if (obj.stroke) {
					// obj.group.setRawNodeAttr("stroke", obj.stroke);
				// }
				// if (obj.strokemiterlimit) {
					// obj.group.setRawNodeAttr("stroke-miterlimit", obj.strokemiterlimit);
				// }
				// if (obj.strokewidth) {
					// obj.group.setRawNodeAttr("stroke-width", obj.strokewidth);
				// }
				// if (obj.strokeopacity) {
					// obj.group.setRawNodeAttr("stroke-opacity", obj.strokeopacity);
				// }
				// if (obj.fontsize)
				// {
					// obj.group.setRawNodeAttr("font-size", obj.fontsize);
				// }
				// if (obj.fontweight)
				// {
					// obj.group.setRawNodeAttr("font-weight", obj.fontweight);
				// }
				// if (obj.fontstyle)
				// {
					// obj.group.setRawNodeAttr("font-style", obj.fontstyle);
				// }
				// if (obj.lineheight)
				// {
					// obj.group.setRawNodeAttr("line-height", obj.lineheight);
				// }
				// if (obj.letterspacing)
				// {
					// obj.group.setRawNodeAttr("letter-spacing", obj.letterspacing);
				// }
				// if (obj.wordspacing)
				// {
					// obj.group.setRawNodeAttr("word-spacing", obj.wordspacing);
				// }
				// if (obj.fontfamily)
				// {
					// obj.group.setRawNodeAttr("font-family", obj.fontfamily);
				// }
			}
				
			// DEFS
			if (obj.nodeName == "defs") {
				this._processDefs();
			}
			
			if (obj.nodeName == "feGaussianBlur") {
				this._processGaussianBlur(obj);
			}
			
			if (obj.nodeName == "filter") {
				this._processFilter(obj);
			}
			
			if (obj.nodeName == "radialGradient") {
				this._parseRadialGradient(obj);
			}
			
			if (obj.nodeName == "linearGradient") {
				this._parseLinearGradient(obj);
			}

			// SHAPES
			if (obj.nodeName == "rect") {	
				if (obj.group) {
					obj.group.add(this._parseRect(obj));
				} else {
					this._surface.add(this._parseRect(obj));
				}
			}
			
			if (obj.nodeName == "circle" || obj.nodeName == "ellipse") {
				if (obj.group) {
					obj.group.add(this._parseEllipse(obj));
				} else {
					this._surface.add(this._parseEllipse(obj));
				}
			}
			
			if (obj.nodeName == "line") {
				if (obj.group) {
					obj.group.add(this._parseLine(obj));
				} else {
					this._surface.add(this._parseLine(obj));
				}
			}
			
			if (obj.nodeName == "polyline" || obj.nodeName == "polygon") {
				if (obj.group) {
					obj.group.add(this._parsePolyline(obj));
				} else {
					this._surface.add(this._parsePolyline(obj));
				}
			}
			
			if (obj.nodeName == "path") {
				if (obj.group) {
					obj.group.add(this._parsePath(obj));
				} else {
					this._surface.add(this._parsePath(obj));
				}
			}
			
			if (obj.nodeName == "text") {
				if (obj.group) {
					obj.group.add(this._parseText(obj));
				} else {
					this._surface.add(this._parseText(obj));
				}
			}
		},
		
		_processFilter : function(obj) {
			return this._parseFilter(gfx.defaultFilter, obj);
		},
		
		_processGaussianBlur : function(obj) {
			return this._parseGaussianBlur(gfx.defaultGaussianBlur, obj);
		},
			
		_processDefs : function() {
			for (var n in this._defs) {
				var fill = this._defs[n];
				this._surface.addFill(fill);
			}
		},
		
		_makeParametersNoDefaults : function(defaults, update) {
			//	summary:
			//		creates an object using the default obj as a filter and copies values
			//		from the 'update' object to the returned object; NO default values from the
			//		defaults object are copied to the returned object
			//	defaults: Object
			//		the object with the default set of params
			//	update:   Object
			//		the object whose properties are to be cloned during updating
			//  returns: Object
			//      an object that ONLY contains the update values; NO default values from
			//      the defaults object are provided back in this object

			var i = null;
			// If update is not an object return an empty object
			if (!update) {
				return {};
			}
			var result = {};
			for (i in defaults) {
				if (!( i in result) && (( i in update) || (i.toLowerCase() in update))) {
					if ( i in update) {
						result[i] = lang.clone(update[i]);
					} else {
						// Console.warn("case conflict in property name", i);
						result[i] = lang.clone(update[i.toLowerCase()]);
					}
				}
			}
			return result;
		},
			
		//	Summary:
		//		Used to look up actual attr names based on default object names
		//		the keys in the dict are the concatenated xml attr names
		//		the vals are the gfx obj attr names
		//
		// Extend this object to include the entire mapping of xml attrs to gfx attrs by extending _base.js, and svg.js
		// Keys are the inkscape names and their values are Gfx names
		attrLookup : {
			
			stroke : {
				id : "id",
				stroke : "color",
				strokeopacity : "opacity", 
				strokewidth : "width", 
				strokelinecap : "cap",
				strokelinejoin : "join",
				strokemiterlimit : "miterlimit",
				strokedasharray : "dasharray",
				strokedashoffset : "dashoffset"
			},
			
			radialGradient : {
				id : "id",
				gradientTransform : "gradientTransform",
				gradientUnits : "gradientUnits",
				fy : "fy",
				fx : "fx",
				r : "r",
				cy : "cy",
				cx : "cx",
				spreadMethod : "",
				colors : "colors",
				xlinkhref : "xlinkhref"
			},	
		 
			linearGradient : {
				id : "id",
				spreadMethod : "spreadMethod",
				gradientTransform : "gradientTransform",
				gradientUnits : "gradientUnits",
				y1 : "y1",
				x1 : "x1",
				x2 : "x2",
				y2 : "y2",
				colors : "colors",
				xlinkhref : "xlinkhref"
			},
			
			fill : {
				id: "id",
				fill : "color",
				fillrule : "fillrule",
				fillopacity : "fillopacity",
				filter : "filter"
			},
			
			path: {
				id: "id",
				d: "d",
				transform: "transform",
				pathLength: "pathLength"
			},
			
			rect: {
				id : "", 
				x: "x",
				y: "y",
				width: "width",
				height: "height",
				r: "r",
				rx: "rx",
				ry: "ry"
			},
			
			text : {
				fontsize: "fontsize",
				fontstretch :"fontstretch",	
				fontweight :"fontweight", 
				fontvariant : "fontvariant", 
				fontstyle :"fontstyle", 
				lineheight :"lineheight", 
				letterspacing :"letterspacing", 
				wordspacing : "wordspacing", 
				fontfamily :"fontfamily"
			},
			
			filter : {
				id: "id",
				x: "x",
				y: "y",
				width: "width",
				height: "height",
				colorinterpolationfilters: "colorInterpolationFilters",
				xlinkhref : "xlinkhref"
			},
			
			feGaussianBlur : {
				id: "id",
				stdDeviation: "stdDeviation",
				xlinkhref : "xlinkhref"
			}
		},
	
		normalizeAttrs : function(obj, nodeType) {
			//	summary:
			//		this is used to avoid all of the "if" blocks in the conversion
			//	obj:
			//		object of concatenated xml node name value pairs
			//	nodeType:
			//		e.g. stroke; used to look up the svg attr's name
			for (key in obj) {
				var attr = this.attrLookup[nodeType][key];
				if (attr) {
					obj[attr] = obj[key];
				} 
			}
		},
		
		_parseFilter : function(defaults, obj) {
			lang.mixin(obj, {type: defaults.type});
			this.normalizeAttrs(obj, "filter");
			var filter = this._makeParametersNoDefaults(defaults, obj);		
			if (obj.feGaussianBlurs) {
				for (n in obj.feGaussianBlurs) {			
					filter.feGaussianBlurs = this._parseGaussianBlur(gfx.defaultGaussianBlur, obj.feGaussianBlurs[n]);
				}
			}
			this._defs[obj.id] = filter;
			return filter;
		},
		
		_parseGaussianBlur : function(defaults, obj) {
			lang.mixin(obj, {type: defaults.type});	
			this.normalizeAttrs(obj, "feGaussianBlur");
			var gaussianBlur = this._makeParametersNoDefaults(defaults, obj);			
			this._defs[obj.id] = gaussianBlur;
			return gaussianBlur;
		},
		
		_parseLinearGradient : function(obj) {
			return this._parseGradient(gfx.defaultLinearGradient, obj);
		},
		
		_parseRadialGradient : function(obj) {
			return this._parseGradient(gfx.defaultRadialGradient, obj);
		},
		
		_parseGradient : function(defaults, obj) {
			lang.mixin(obj, {type: defaults.type});
			
			if (obj.type == "radial") {
				this.normalizeAttrs(obj, "radialGradient");
				var gradient = this._makeParametersNoDefaults(defaults, obj);
			}
			
			if (obj.type == "linear") {
				this.normalizeAttrs(obj, "linearGradient");
				var gradient = this._makeParametersNoDefaults(defaults, obj);
			}
			
			// Since gfx has the concept of colors and not stops; convert the stops to colors
			if (obj.stops) {
				gradient.colors = this._parseStops(obj.stops);
			}
			
			// Add to our defs object
			this._defs[obj.id] = gradient;
			return gradient;
		},
		
		_parseStops : function(objArray) {
			// objArray:
			//		Array of objects
			var _stops = [];
			var xcolor = null;
			var c = null;
			if (objArray instanceof Array) {
				array.forEach(objArray, function(item) {
					if (item.id) {
						if (item.stopcolor.trim().substring(0, 1) == "#") {
							xcolor = Color.fromHex(item.stopcolor.trim());
						} else if (item.stopcolor.trim().substring(0, 3) == "rgb") {
							xcolor = Color.fromRgb(item.stopcolor.trim());
						} else {
							xcolor = Color.fromString(item.stopcolor.trim()).toRgb();
						}
						xcolor.a = Number(item.stopopacity ? item.stopopacity : 1);
						c = {
							id : item.id,
							color : xcolor,
							stopopacity : item.stopopacity ? item.stopopacity : 1,
							offset : item.offset
						};
						_stops.push(c);
					}
				}, this);
			}	
			return _stops;
		},
		
		_parseColor : function(c, opacity) {
			// c:
			//		node color: String
			// opacity:
			//		node opacity: range 0-1
			var color = "none";
			if (c) {
				if (c.trim().substring(0, 1) == "#") {
					color = Color.fromHex(c.trim());
					color.a = Number(opacity ? opacity : 1);			
				} else if (c.trim().substring(0, 4) == "rgb(") {
					color = Color.fromRgb(c.trim());
					color.a = Number(opacity ? opacity : 1);					
				} else if (c.trim().substring(0, 5) == "url(#") {
					color = this._defs[c.trim().substring(5, c.length - 1)];				
				} else {
					color = Color.fromString(c.trim());
					color.a = Number(opacity ? opacity : 1);
				}
			}	
			return color;
		},
		
		_parseStroke : function(obj) {
			// obj:
			//		this is the node not a stroke obj
			if (obj.stroke == "none") {
				return;
			}
			this.normalizeAttrs(obj, "stroke");
			var stroke = gfx.makeParameters(gfx.defaultStroke, obj);
			if (obj.xlinkhref) {
				stroke.xlinkhref = obj.xlinkhref;
			} else {
				if (obj.stroke) {
					stroke.color = this._parseColor(obj.stroke, obj.strokeopacity);
				}
			}
			return stroke;
		},
		
		_parseFill : function(obj) {
			// obj:
			//		this is the node not a fill obj
			if (obj.fill == "none") {
				return;
			}
			this.normalizeAttrs(obj, "fill");
			//var fill = gfx.makeParameters(gfx.defaultFill, obj);	//FIXME works for application icons but not for tiger.svg
			var fill = this._makeParametersNoDefaults(gfx.defaultFill, obj); //FIXME works for tiger.svg but not application icons
			fill.type = "fill";
			if (obj.fill) {
				fill.paint = this._parseColor(obj.fill, obj.fillopacity); //FIXME change fill.paint to fill.fill based on SVG spec
			}
			return fill;
		},
		
		_parseShape : function(obj, defaults, creator) {
			//	summary:
			//		this is the default conversion; should work in most cases
			//	obj;
			//		the svg->xml node as a JS object
			//	defaults:
			//		base default object for the gfx shape
			//	creator:
			//		the object factory for the shape type
			//
			//TODO: add normalizeAttrs func call to this func after xml->gfx map is complete for all shapes;
			// lang.mixin(obj, {type: defaults.type});
			// var shape = this._surface.createObject(creator, this._makeParametersNoDefaults(defaults, obj));
			var shape = this._surface.createObject(creator, gfx.makeParameters(defaults, obj));
			
			if (obj.filter) {
				shape.setRawNodeAttr("filter", obj.filter);
			}
			
			if (obj.transform) {
				shape.setTransform(this._parseTransformation(obj.transform));
			}	
				
			if (obj.display) {
				shape.setRawNodeAttr("display", obj.display);
			}		
				
			if (obj.visibility) {
				shape.setRawNodeAttr("visibility", obj.visibility);
			}
			
			if (obj.opacity) {
				shape.setRawNodeAttr("opacity", obj.opacity);
			}	
				
			if (obj.overflow) {
				shape.setRawNodeAttr("overflow", obj.overflow);
			}		
			
			if (obj.marker) {
				shape.setRawNodeAttr("marker", obj.marker);
			}			
			// if (obj.color) {
				// shape.setRawNodeAttr("color", obj.color); //FIXME Path is a shape which leads to a name conflict between inkscape color and path.color
			// }		
			if (obj.stroke && obj.stroke != "none") {
				shape.setStroke(this._parseStroke(obj));
			} else if (obj.stroke && obj.stroke == "none") {
				shape.setRawNodeAttr("stroke", obj.stroke); // SVG spec initial: none and Inkscape sets to none
			} else if (!obj.stroke && obj.parentNode.nodeName == "g" && obj.parentNode.stroke) {
				shape.setRawNodeAttr("stroke", obj.parentNode.stroke);	
			}
			
			if (obj.strokeopacity) {
				shape.setRawNodeAttr("stroke-opacity", obj.strokeopacity);
			} else if (!obj.strokeopacity && obj.parentNode.nodeName == "g" && obj.parentNode.strokeopacity) {
				shape.setRawNodeAttr("stroke-opacity", obj.parentNode.strokeopacity);	
			}	
				
			if (obj.strokewidth) {
				shape.setRawNodeAttr("stroke-width", obj.strokewidth);
			} else if (!obj.strokewidth && obj.parentNode.nodeName == "g" && obj.parentNode.strokewidth) {
				shape.setRawNodeAttr("stroke-width", obj.parentNode.strokewidth);	
			}
			
			if (obj.strokelinecap) {
				shape.setRawNodeAttr("stroke-linecap", obj.strokelinecap);
			} else if (!obj.strokelinecap && obj.parentNode.nodeName == "g" && obj.parentNode.strokelinecap) {
				shape.setRawNodeAttr("stroke-linecap", obj.parentNode.strokelinecap);	
			}
			
            if (obj.strokelinejoin) {
                shape.setRawNodeAttr("stroke-linejoin", obj.strokelinejoin);
            } else if (!obj.strokelinejoin && obj.parentNode.nodeName == "g" && obj.parentNode.strokelinejoin) {
				shape.setRawNodeAttr("stroke-linejoin", obj.parentNode.strokelinejoin);	
			}
            	
			if (obj.miterlimit) {
				shape.setRawNodeAttr("stroke-miterlimit", obj.miterlimit);
			} else if (!obj.miterlimit && obj.parentNode.nodeName == "g" && obj.parentNode.miterlimit) {
				shape.setRawNodeAttr("stroke-miterlimit", obj.parentNode.miterlimit);	
			}
				
			if (obj.dasharray) {
				shape.setRawNodeAttr("stroke-dasharray", obj.dasharray);
			} else if (!obj.dasharray && obj.parentNode.nodeName == "g" && obj.parentNode.dasharray) {
				shape.setRawNodeAttr("stroke-dasharray", obj.parentNode.dasharray);	
			}
				
			if (obj.dashoffset) {
				shape.setRawNodeAttr("stroke-dashoffset", obj.dashoffset);
			} else if (!obj.dashoffset && obj.parentNode.nodeName == "g" && obj.parentNode.dashoffset) {
				shape.setRawNodeAttr("stroke-dashoffset", obj.parentNode.dashoffset);	
			}

			if (obj.fill && obj.fill != "none") {
				shape.setFill(this._parseFill(obj));					
			} else if (obj.fill && obj.fill == "none") {
				shape.setRawNodeAttr("fill", obj.fill);						
			} else if (!obj.fill && obj.parentNode.nodeName == "g" && obj.parentNode.fill) {
				shape.setRawNodeAttr("fill", obj.parentNode.fill);	
			} else {
				shape.setFill(this._parseFill(obj));
			}
			
			if (obj.fillopacity) {
				shape.setRawNodeAttr("fill-opacity", obj.fillopacity);
			}  else if (!obj.fillopacity && obj.parentNode.nodeName == "g" && obj.parentNode.fillopacity) {
				shape.setRawNodeAttr("fill-opacity", obj.parentNode.fillopacity);	
			}
			
			if (obj.fillrule) {
				shape.setRawNodeAttr("fill-rule", obj.fillrule);
			} else if (!obj.fillrule && obj.parentNode.nodeName == "g" && obj.parentNode.fillrule) {
				shape.setRawNodeAttr("fill-rule", obj.parentNode.fillrule);	
			}
			
			if (obj.fontsize) {
				shape.setRawNodeAttr("font-size", obj.fontsize);
			}
			
			if (obj.fontstretch) {
				shape.setRawNodeAttr("font-stretch", obj.fontstretch);
			}
			
			if (obj.fontweight) {
				shape.setRawNodeAttr("font-weight", obj.fontweight);
			}
			
			if (obj.fontvariant) {
				shape.setRawNodeAttr("font-variant", obj.fontvariant);
			}
			
			if (obj.fontstyle) {
				shape.setRawNodeAttr("font-style", obj.fontstyle);
			}
			
			if (obj.lineheight) {
				shape.setRawNodeAttr("line-height", obj.lineheight);
			}
			
			if (obj.letterspacing) {
				shape.setRawNodeAttr("letter-spacing", obj.letterspacing);
			}
			
			if (obj.wordspacing) {
				shape.setRawNodeAttr("word-spacing", obj.wordspacing);
			}
			
			if (obj.fontfamily) {
				shape.setRawNodeAttr("font-family", obj.fontfamily);
			}
			
			if (obj.rx) {
				shape.setRawNodeAttr("rx", obj.rx);
			}
			
			if (obj.ry) {
				shape.setRawNodeAttr("ry", obj.ry);
			}
			return shape;
		},
			
		_parseLine : function(obj) {
			return this._parseShape(obj, gfx.defaultLine, gfx.svg.Line);
		},
		
		_parsePath : function(obj) {
			return this._parseShape(obj, gfx.defaultPath, gfx.svg.Path);
		},
		
		_parseEllipse : function(obj) {
			return this._parseShape(obj, gfx.defaultEllipse, gfx.svg.Ellipse);
		},
		
		_parseRect : function(obj) {
			return this._parseShape(obj, gfx.defaultRect, gfx.svg.Rect);
		},
		
		_parsePolyline : function(obj) {
			return this._parseShape(obj, gfx.defaultPolyline, gfx.svg.Polyline);
		},
		
		_parseText : function(obj) {
			return this._parseShape(obj, gfx.defaultText, gfx.svg.Text);
		},

		_parseTransformation : function(arg) {
			// Implements SVG spec transformation applying gfx functions
			var matrix = { // identity matrix
				xx : 1,
				yx : 0,
				xy : 0,
				yy : 1,
				dx : 0,
				dy : 0
			};		
			var s = arg.split("(");
			var f = s[0];
            var a = s[1].slice(0, s[1].length-1).split(",");
            var m = gfx.matrix;
            
            switch (f) {
            	case "matrix":
            		var i = 0;
	            	for (var n in matrix) {
						matrix[n] = Number(a[i++]);
					}
            		break;
            	case "translate":
            		if (a.length === 1) {
            			matrix = m.translate(Number(a[0]), 0);
            		} else {
            			matrix = m.translate(Number(a[0]), Number(a[1]));
            		}
            		break; 
            	case "scale":
            		if (a.length === 1) {
            			matrix = m.scale(Number(a[0]), a[0]);
            		} else {
            			matrix = m.scale(Number(a[0]), Number(a[1]));
            		}         		
            		break;
            	case "rotate": // SVG spec uses degrees
            		if (a.length === 1) {
            			matrix = m.rotateg(Number(a[0]));
            		} else {
            			matrix = m.rotategAt(Number(a[0]), Number(a[1]), Number(a[2]));
            		}      		
            		break; 
            	case "skewX": // SVG spec uses degrees
            		matrix = m.screwXg(Number(a[0]));
            		break; 
            	case "skewY": // SVG spec uses degrees
            		matrix = m.skewYg(Number(a[0]));
            		break; 
            }
            return matrix;
		}
	});
});
