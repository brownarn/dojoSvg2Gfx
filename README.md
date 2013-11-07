dojoSvg2Gfx
===========

SVG to Dojo 1.9.1 GFX converter

This is an all JavaScript converter written in the dojo style for Dojo Toolkit version 1.9.1. It uses the dojox/xml/DomParser to form a javascipt object that is furter parsed en route to forming dojox GFX shapes that are placed on a surface. The resulting GFX is serialized to a JSON then deserialized back to an GFX widget as an Icon that is then added as a child to the IconContainer attached to the page. This is done to demonstrate the full cycle. In the Karma project, from which this utility was extracted, we create icons as Z-stack layered SVGs that we serialize as JSONs at 'development time' and upload to our database. At run-time the JSONs from the database and are deserialized back to GFX widgets that are attached to domNodes. Using this approach we've quickly created a full icon set in Inkscape by modifyiing the Tango icons from OpenClipart.org that we use in lieu of the dojo icons to create scalable dynamic icons (i.e. translate, rotate, scale). 
