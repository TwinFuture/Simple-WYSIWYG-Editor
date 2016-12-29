```
	* Simple WYSIWYG Editor
	* http://www.uniquez-home.com/WYSIWYG/
	*
	*
	* Simple WYSIWYG Editor is licensed under the GNU General Public License Version 2 or later:
	* http://www.gnu.org/licenses/gpl.html
	*
	* @fileoverview Simple WYSIWYG Editor - A feather weight WYSIWYG editor,
	*				coded in plain Javascript featuring a light elegant design.
	* @copyright Copyright (C) 2016 Alec Johnson (www.uniquez-home.com)
	* @author Alec Johnson
	* @version 1.0.0
```

##Fork, create a new branch, download, commit changes and create a pull request for any changes.

##Requires Nodejs and Grunt.

Install Nodejs https://nodejs.org/

Goto the Simple-WYSIWYG-Editor folder and shift right click.
Click on Open command window here then do commands below.

Install grunt:

`npm install grunt -g`

Then install required modules for the project by running.

`npm install`

To build the project and output the dist directory with an example.html.

`grunt`

After running grunt you will see a new folder created named dist, this is where all the js scripts concatenate except for the plugins directory, which will just be copied over.

Workflow: Edit source files, which will be output to the dist folder and you can then open example.html and see your changes live.
