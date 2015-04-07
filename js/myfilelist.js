/**
 * ownCloud - recover - adapted from OC Core Files Trashbin filelist.js
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 */
(function() {
	var DELETED_REGEXP = new RegExp(/^(.+)\.d[0-9]+$/);
	// how to define? in script.js (angular) ok, here -> "$provide is undefined"
	// hab ich bereits in angular module config, nix doppelt machen!!!
	//$provide.constant('BASE_URL', OC.generateUrl('/apps/recover'));
	/**
	 * Convert a file name in the format filename.d12345 to the real file name.
	 * This will use basename.
	 * The name will not be changed if it has no ".d12345" suffix.
	 * @param {String} name file name
	 * @return {String} converted file name
	 */
	function getDeletedFileName(name) {
		name = OC.basename(name);
		var match = DELETED_REGEXP.exec(name);
		if (match && match.length > 1) {
			name = match[1];
		}
		return name;
	}

	/**
	 * @class OCA.Recover.FileList
	 * @augments OCA.Files.FileList
	 * @classdesc List of deleted files
	 *
	 * @param $el container element with existing markup for the #controls
	 * and a table
	 * @param [options] map of options
	 */
	var FileList = function($el, options) {
		this.initialize($el, options);
	};
	FileList.prototype = _.extend({}, OCA.Files.FileList.prototype,
		/** @lends OCA.Recover.FileList.prototype */ {
		id: 'recover',
		appName: 'Recover',

		/**
		 * @private
		 */
		initialize: function() {
			var result = OCA.Files.FileList.prototype.initialize.apply(this, arguments);
			this.$el.find('.undelete').click('click', _.bind(this._onClickRestoreSelected, this));
			this.setSort('mtime', 'desc');
			// adaption to set path
			this.breadcrumb.setDirectory('/');
			/**
			 * Override crumb making to add "Deleted Files" entry
			 * and convert files with ".d" extensions to a more
			 * user friendly name.
			 */
			this.breadcrumb._makeCrumbs = function() {
				var parts = OCA.Files.BreadCrumb.prototype._makeCrumbs.apply(this, arguments);
				for (var i = 1; i < parts.length; i++) {
					parts[i].name = getDeletedFileName(parts[i].name);
					//console.log("parts[i].name = " + parts[i].name);
				}
				return parts;
			};

			OC.Plugins.attach('OCA.Recover.FileList', this);
			return result;
		},

		/**
		 * Override to only return read permissions
		 */
		getDirectoryPermissions: function() {
			return OC.PERMISSION_READ | OC.PERMISSION_DELETE;
		},

		_setCurrentDir: function(targetDir) {
			OCA.Files.FileList.prototype._setCurrentDir.apply(this, arguments);

			var baseDir = OC.basename(targetDir);
			if (baseDir !== '') {
				this.setPageTitle(getDeletedFileName(baseDir));
			}
		},
		// all files still exist / ok here
		_createRow: function() {
			// FIXME: MEGAHACK until we find a better solution
			var tr = OCA.Files.FileList.prototype._createRow.apply(this, arguments);
			tr.find('td.filesize').remove();
			//console.log('in createRow  this.files[0].displayName = ' + this.files[0].displayName); 
			return tr;
		},
		// must be the problems source
		_renderRow: function(fileData, options) {
			options = options || {};
			var dir = this.getCurrentDirectory();
			var dirListing = dir !== '' && dir !== '/';
			// show deleted time as mtime
			if (fileData.mtime) {
				fileData.mtime = parseInt(fileData.mtime, 10);
			}
			if (!dirListing) {
				fileData.displayName = fileData.name;
				fileData.name = fileData.name + '.d' + Math.floor(fileData.mtime / 1000);
			}
			//console.log('in renderRow fileData.displayName = ' + fileData.displayName); 
			return OCA.Files.FileList.prototype._renderRow.call(this, fileData, options);
		},

		// called by reload in /apps/files/js/filelist.js,
		// "list" is hardcoded as action! 
		// obsolete, since triggering route in reload
		// => override with own reload and reloadCallback methods
		/*
		getAjaxUrl: function(action, params) {
			var q = '';
			if (params) {
				q = '?' + OC.buildQueryString(params);
			}
			console.log('in get ajax '); 
			return OC.filePath('recover', 'ajax', action + '.php') + q;
			
			//alert(OC.filePath('recover', action) + q);
			//return OC.filePath('recover', action) + q;
		},
		*/

		/**
		 * Reloads the file list
		 *
		 * @return ajax object (still?)
		 */
		
		reload: function() {
			//console.log('in reload  URL = ' + OC.generateUrl('/apps/recover/trashlist')); 
			this._selectedFiles = {};
			this._selectionSummary.clear();
			this.$el.find('.select-all').prop('checked', false);
			this.showMask();
			// -> params ok, aber http get kackt ab,
			// route didn't match "/trashlist?dir=...."
			if (this._reloadCall) {
				this._reloadCall.abort();
			}
			this._reloadCall = $.ajax({
				//url: 'http://localhost/core/index.php/apps/recover/trashlist', 
				url : OC.generateUrl('/apps/recover/trashlist'),
				data : {
					dir : this.getCurrentDirectory(),
					sort: this._sort,
					sortdirection: this._sortDirection
					
				}
            });
			console.log('dir = ' + this.getCurrentDirectory() + ', sort = ' + this._sort + ', sortdirection = ' + this._sortDirection);

			var callBack = this.reloadCallback.bind(this);
			return this._reloadCall.then(callBack, callBack);
		},
			
		/** from files/js/filelist
		 *  
		 **/
		reloadCallback: function(result) {
			delete this._reloadCall;
			this.hideMask();
			// result.status undefined -> use statusCode
			//console.log("myfilelist reloadCallback result.status = " + result.status);
			//if (!result || result.status === 'error') {
			if (!result || result.statusCode === '500') {
				// if the error is not related to folder we're trying to load, reload the page to handle logout etc
				if (result.data.error === 'authentication_error' ||
					result.data.error === 'token_expired' ||
					result.data.error === 'application_not_enabled'
				) {
					console.log('in reloadCallback redirect to files app');
					OC.redirect(OC.generateUrl('apps/files'));
				}
				OC.Notification.show(result.data.message);
				return false;
			}

			if (result.status === 404) {
				// go back home
				this.changeDirectory('/');
				return false;
			}
			// aborted ?
			if (result.status === 0){
				return true;
			}

			// TODO: should rather return upload file size through
			// the files list ajax call
			this.updateStorageStatistics(true);
			if (result.data.permissions) {
				this.setDirectoryPermissions(result.data.permissions);
			}
			// original -> sends files-array to files/js/filelist.js
			// set files seems ok
			this.setFiles(result.data.files);
			return true;
		},
		
		setupUploadEvents: function() {
			// override and do nothing
		},
		// ??? to be adapted?
		linkTo: function(dir){
			return OC.linkTo('files', 'index.php')+"?view=Recover&dir="+ encodeURIComponent(dir).replace(/%2F/g, '/');
		},

		/**
		 * this.fileList = List of rows (table tbody) = <tbody id="fileList">
		 * rows are added with files/js/filelist.js: add: function(fileData, options)
		 * 		@param {OCA.Files.FileInfo} fileData map of file attributes
		 * 		@param {Object} [options] map of attributes
		 *		...
		 * called by at least self.add( 
		 * 	
		 **/
		updateEmptyContent: function(){
			var exists = this.$fileList.find('tr:first').exists();
			this.$el.find('#emptycontent').toggleClass('hidden', exists);
			this.$el.find('#filestable th').toggleClass('hidden', !exists);
		},

		/**  is only used when deleting entries from the list **/
		_removeCallback: function(result) {
			//console.log('RESULT in _removeCallback = ' + result.toSource());
			// result.status is undefined! WHY?????
			//if (result.status !== 'success') {
			if (result.statusCode !== '200') {
				console.log('Error in RECOVER myfilelist _removeCallback result.statusCode = ' + result.statusCode);
				// triggers "unnecessary" Error Message...
				OC.dialogs.alert(result.data.message, t('recover', 'Error'));
			}

			var files = result.data.success;
			//console.log(' _removeCallback files = result.data.success[0].filename = ' + result.data.success[0].filename);
			var $el;
			for (var i = 0; i < files.length; i++) {
				$el = this.remove(OC.basename(files[i].filename), {updateSummary: false});
				this.fileSummary.remove({type: $el.attr('data-type'), size: $el.attr('data-size')});
			}
			this.fileSummary.update();
			this.updateEmptyContent();
			this.enableActions();
		},

		_onClickRestoreSelected: function(event) {
			event.preventDefault();
			var self = this;
			var allFiles = this.$el.find('.select-all').is(':checked');
			var files = [];
			var params = {};
			this.disableActions();
			if (allFiles) {
				this.showMask();
				params = {
					allfiles: true,
					dir: this.getCurrentDirectory()
				};
			}
			else {
				files = _.pluck(this.getSelectedFiles(), 'name');
				for (var i = 0; i < files.length; i++) {
					var deleteAction = this.findFileEl(files[i]).children("td.date").children(".action.delete");
					deleteAction.removeClass('icon-delete').addClass('icon-loading-small');
				}
				params = {
					files: JSON.stringify(files),
					dir: this.getCurrentDirectory()
				};
			}

			//$.post(OC.filePath('recover', 'ajax', 'undelete.php'),
			$.post(OC.generateUrl('/apps/recover/recover'), 
				params,
				function(result) {
					if (allFiles) {
						//if (result.status !== 'success') {
						if (result.statusCode !== '200') {
							console.log('in Recover myfilelist _onClickRestoreSelected result.statusCode = ' + result.statusCode);
							OC.dialogs.alert(result.data.message, t('recover', 'Error'));
						}
						self.hideMask();
						// simply remove all files
						self.setFiles([]);
						self.enableActions();
					}
					else {
						// isn't run when recovering a file by clicking recover
						//console.log('in Recover myfilelist _onClickRestoreSelected before _removeCallback result = ' + result);
						self._removeCallback(result);
					}
				}
			);
		},

		_onClickDeleteSelected: function(event) {
			event.preventDefault();
			var self = this;
			var allFiles = this.$el.find('.select-all').is(':checked');
			var files = [];
			var params = {};
			if (allFiles) {
				params = {
					allfiles: true,
					dir: this.getCurrentDirectory()
				};
			}
			else {
				files = _.pluck(this.getSelectedFiles(), 'name');
				params = {
					files: JSON.stringify(files),
					dir: this.getCurrentDirectory()
				};
			}

			this.disableActions();
			if (allFiles) {
				this.showMask();
			}
			else {
				for (var i = 0; i < files.length; i++) {
					var deleteAction = this.findFileEl(files[i]).children("td.date").children(".action.delete");
					deleteAction.removeClass('icon-delete').addClass('icon-loading-small');
				}
			}

			//$.post(OC.filePath('recover', 'ajax', 'delete.php'),
			$.post(OC.generateUrl('/apps/recover/delete'),
					params,
					function(result) {
						if (allFiles) {
							//if (result.status !== 'success') {
							if (result.statusCode !== '200') {
								OC.dialogs.alert(result.data.message, t('recover', 'Error'));
							}
							self.hideMask();
							// simply remove all files
							self.setFiles([]);
							self.enableActions();
						}
						else {
							self._removeCallback(result);
						}
					}
			);
		},

		_onClickFile: function(event) {
			var mime = $(this).parent().parent().data('mime');
			if (mime !== 'httpd/unix-directory') {
				event.preventDefault();
			}
			return OCA.Files.FileList.prototype._onClickFile.apply(this, arguments);
		},
		// what for ? -> must be adapted to use framework (route + controller)
		// isn't run, when should it be run?
		generatePreviewUrl: function(urlSpec) {
			console.log('in generatePreviewUrl');
			return OC.generateUrl('/apps/recover/ajax/preview.php?') + $.param(urlSpec);
		},

		/*
		PERHAPS I WILL ENABLE DOWNLAODS? USEFUL?
		*/
		getDownloadUrl: function() {
			// no downloads
			return '#';
		},

		enableActions: function() {
			console.log('in enableActions');
			this.$el.find('.action').css('display', 'inline');
			this.$el.find(':input:checkbox').css('display', 'inline');
		},

		disableActions: function() {
			this.$el.find('.action').css('display', 'none');
			this.$el.find(':input:checkbox').css('display', 'none');
		},

		updateStorageStatistics: function() {
			// no op because the Recover doesn't have
			// storage info like free space / used space
		},

		isSelectedDeletable: function() {
			return true;
		}

	});

	OCA.Recover.FileList = FileList;
})();