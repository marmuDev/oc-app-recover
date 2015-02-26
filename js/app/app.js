/**
 * ownCloud - mynewapp - Recover - adapted from trashbin among others
 *	
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015

	script.js in app.js, config.js, run.js und 
	weitere bestandteile wie controller etc. unterteilen

 */
if (!OCA.Files) {
		/**
		 * Namespace for the files app
		 * @namespace OCA.Files
		 */
		OCA.Files = {};
	}

if (!OCA.Recover) {
	/**
	 * Namespace for the recover app
	 * @namespace OCA.Recover
	 */
	OCA.Recover = {};
}

/**
 * @namespace OCA.Recover.App
 */
OCA.Recover.App = {
	_initialized: false,

	initialize: function($el) {
		if (this._initialized) {
			return;
		}
		console.log('in init from OCA.Recover.App');
		this._initialized = true;
		this.fileList = new OCA.Recover.FileList(
			$('#app-content-trashbin'), {
				scrollContainer: $('#app-content'),
				fileActions: this._createFileActions()
			}
		);
	},

	// adapt according to file source and coresponding functions etc.
	_createFileActions: function() {
		var fileActions = new OCA.Files.FileActions();
		fileActions.register('dir', 'Open', OC.PERMISSION_READ, '', function (filename, context) {
			var dir = context.fileList.getCurrentDirectory();
			if (dir !== '/') {
				dir = dir + '/';
			}
			context.fileList.changeDirectory(dir + filename);
		});

		fileActions.setDefault('dir', 'Open');

		fileActions.register('all', 'Recover', OC.PERMISSION_READ, OC.imagePath('core', 'actions/history'), function(filename, context) {
			var fileList = context.fileList;
			var tr = fileList.findFileEl(filename);
			var deleteAction = tr.children("td.date").children(".action.delete");
			deleteAction.removeClass('icon-delete').addClass('icon-loading-small');
			fileList.disableActions();
			// AJAX path for PHP!!!
			// AJAX path for PHP!!!
			// AJAX path for PHP!!!
			$.post(OC.filePath('mynewapp', 'ajax', 'recover.php'), {
					files: JSON.stringify([filename]),
					dir: fileList.getCurrentDirectory()
				},
				_.bind(fileList._removeCallback, fileList)
			);
		}, t('mynewapp', 'Recover'));

		fileActions.registerAction({
			name: 'Delete',
			displayName: '',
			mime: 'all',
			permissions: OC.PERMISSION_READ,
			icon: function() {
				return OC.imagePath('core', 'actions/delete');
			},
			render: function(actionSpec, isDefault, context) {
				var $actionLink = fileActions._makeActionLink(actionSpec, context);
				$actionLink.attr('original-title', t('mynewapp', 'Delete permanently'));
				$actionLink.children('img').attr('alt', t('mynewapp', 'Delete permanently'));
				context.$file.find('td:last').append($actionLink);
				return $actionLink;
			},
			actionHandler: function(filename, context) {
				var fileList = context.fileList;
				$('.tipsy').remove();
				var tr = fileList.findFileEl(filename);
				var deleteAction = tr.children("td.date").children(".action.delete");
				deleteAction.removeClass('icon-delete').addClass('icon-loading-small');
				fileList.disableActions();
				$.post(OC.filePath('mynewapp', 'ajax', 'delete.php'), {
						files: JSON.stringify([filename]),
						dir: fileList.getCurrentDirectory()
					},
					_.bind(fileList._removeCallback, fileList)
				);
			}
		});
		return fileActions;
	}
};

// hack from files/ja/app.js
$(document).ready(function() {
	// wait for other apps/extensions to register their event handlers and file actions 
	// in the "ready" clause
	_.defer(function() { 
			OCA.Recover.App.initialize();
	});
});
/**
$(document).ready(function() {
	$('#app-content-trashbin').one('show', function() {
		var App = OCA.Recover.App;
		App.initialize($('#app-content-trashbin'));
		// force breadcrumb init
		// App.fileList.changeDirectory(App.fileList.getCurrentDirectory(), false, true);
	});
});
**/
