/**
 * ownCloud - recover - adapted from OC Core Recover filelist.js
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
			console.log('in init of OCA.Recover.FileList');
			this.setSort('mtime', 'desc');
			/**
			 * Override crumb making to add "Deleted Files" entry
			 * and convert files with ".d" extensions to a more
			 * user friendly name.
			 */
			this.breadcrumb._makeCrumbs = function() {
				var parts = OCA.Files.BreadCrumb.prototype._makeCrumbs.apply(this, arguments);
				for (var i = 1; i < parts.length; i++) {
					parts[i].name = getDeletedFileName(parts[i].name);
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
			console.log('in get dir permissions in myfilelist'); // -> not run!
			return OC.PERMISSION_READ | OC.PERMISSION_DELETE;
		},

		_setCurrentDir: function(targetDir) {
			OCA.Files.FileList.prototype._setCurrentDir.apply(this, arguments);

			var baseDir = OC.basename(targetDir);
			if (baseDir !== '') {
				this.setPageTitle(getDeletedFileName(baseDir));
			}
		},

		_createRow: function() {
			console.log('in createRow in myfilelist'); // -> not run!
			// FIXME: MEGAHACK until we find a better solution
			var tr = OCA.Files.FileList.prototype._createRow.apply(this, arguments);
			tr.find('td.filesize').remove();
			return tr;
		},

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
			console.log('in get ajax in myfilelist'); 
			return OC.filePath('recover', 'ajax', action + '.php') + q;
			
			//alert(OC.filePath('recover', action) + q);
			//return OC.filePath('recover', action) + q;
		},
		*/

		/**
		 * Reloads the file list
		 *
		 * @return ?
		 */
		
		reload: function() {
			console.log('in reload in myfilelist URL = ' + OC.generateUrl('/apps/recover/trashlist')); 
			this._selectedFiles = {};
			this._selectionSummary.clear();
			this.$el.find('.select-all').prop('checked', false);
			this.showMask();
			var trashData = 'init';
			// -> params ok, aber http get kackt ab,
			// mit angular $http.get (recentController) gehts, so nicht!
			// auch nicht mit adresse in browser eingeben -> redirect!!
			console.log("this dir = " + this.getCurrentDirectory());    
			console.log("this sort = " + this._sort);
			console.log("this sort direction = " + this._sortDirection);
			$.getJSON('http://localhost/core/index.php/apps/recover/trashlist', 
				{
					dir : this.getCurrentDirectory(),
					sort: this._sort,
					sortdirection: this._sortDirection
				}, function(data) {
            		trashData = data;
            		console.log("trashData in reload = \n" + trashData.files.toSource());    
            	}
            );
			this.setFiles(trashData.files);
		},
			/**
			if (this._reloadCall) {
				this._reloadCall.abort();
			}
			
			this._reloadCall = $.ajax({
				// url: this.getAjaxUrl('list'), -> now "listtrash"
				//url: BASE_URL + '/listtrash',
				url: OC.generateUrl('/apps/recover/trashlist'),
				data: {
					dir : this.getCurrentDirectory(),
					sort: this._sort,
					sortdirection: this._sortDirection
				}
			});
			
			var callBack = this.reloadCallback.bind(this);
			return this._reloadCall.then(callBack, callBack);
		},
		reloadCallback: function(result) {
			delete this._reloadCall;
			this.hideMask();
			console.log('in reloadCallback at the beginning');
			if (!result || result.status === 'error') {
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
				console.log('in reloadCallback status 404 -> go back home');
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
			console.log("result: ", result);
			if (result.data.permissions) {
				this.setDirectoryPermissions(result.data.permissions);
			}
			this.setFiles(result.data.files);

			//$http.get(BASE_URL + '/listtrash')
        	//.success(function(data) {
            	//console.log("data nach list trash = \n" + data.files.toSource());    
            //  	this.setFiles(data.files);
            //})
        	//.error(function() {
	        //   	alert("error during http get in reloadCallback in myfilelist.js");
        	//});
			return true;
		},
		**/
		setupUploadEvents: function() {
			// override and do nothing
		},

		linkTo: function(dir){
			return OC.linkTo('files', 'index.php')+"?view=Recover&dir="+ encodeURIComponent(dir).replace(/%2F/g, '/');
		},

		updateEmptyContent: function(){
			var exists = this.$fileList.find('tr:first').exists();
			this.$el.find('#emptycontent').toggleClass('hidden', exists);
			this.$el.find('#filestable th').toggleClass('hidden', !exists);
		},

		_removeCallback: function(result) {
			if (result.status !== 'success') {
				OC.dialogs.alert(result.data.message, t('recover', 'Error'));
			}

			var files = result.data.success;
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

			$.post(OC.filePath('recover', 'ajax', 'undelete.php'),
				params,
				function(result) {
					if (allFiles) {
						if (result.status !== 'success') {
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

			$.post(OC.filePath('recover', 'ajax', 'delete.php'),
					params,
					function(result) {
						if (allFiles) {
							if (result.status !== 'success') {
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

		generatePreviewUrl: function(urlSpec) {
			return OC.generateUrl('/apps/recover/ajax/preview.php?') + $.param(urlSpec);
		},

		getDownloadUrl: function() {
			// no downloads
			return '#';
		},

		enableActions: function() {
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