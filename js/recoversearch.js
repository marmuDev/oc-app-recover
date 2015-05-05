/**
 * ownCloud - recover - adapted from OC Core Files search.js
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 */
(function() {
	/**
	 * Construct a new FileActions instance
	 * @constructs Files
	 */
	var Files = function() {
		this.initialize();
	};
	/**
	 * @memberof OCA.Search
	 */
	Files.prototype = {

		fileList: null,

		/**
		 * Initialize the file search
		 * what is redundant due to files/js/search.js?
		 */
		initialize: function() {

			var self = this;
			//console.log('RECOVER search init');
			this.fileAppLoaded = function() {
				return !!OCA.Files && !!OCA.Files.App;
			};
			function inFileList($row, result) {
				//console.log('RECOVER search inFileList function');
				if (! self.fileAppLoaded()) {
					console.log('RECOVER search file app not loaded');
					return false;
				}
				var dir = self.fileList.getCurrentDirectory().replace(/\/+$/,'');
				var resultDir = OC.dirname(result.path);
				return dir === resultDir && self.fileList.inList(result.name);
			}
			function updateLegacyMimetype(result) {
				// backward compatibility:
				if (!result.mime && result.mime_type) {
					result.mime = result.mime_type;
				}
			}
			function hideNoFilterResults() {
				var $nofilterresults = $('.nofilterresults');
				if ( ! $nofilterresults.hasClass('hidden') ) {
					$nofilterresults.addClass('hidden');
				}
			}

			this.renderFolderResult = function($row, result) {
				console.log('RECOVER search renderFolderResult function');
				if (inFileList($row, result)) {
					return null;
				}
				hideNoFilterResults();
				/*render folder icon, show path beneath filename,
				 show size and last modified date on the right */
				this.updateLegacyMimetype(result);

				var $pathDiv = $('<div class="path"></div>').text(result.path);
				$row.find('td.info div.name').after($pathDiv).text(result.name);

				$row.find('td.result a').attr('href', result.link);
				$row.find('td.icon').css('background-image', 'url(' + OC.imagePath('core', 'filetypes/folder') + ')');
				return $row;
			};

			this.renderFileResult = function($row, result) {
				console.log('RECOVER search renderFileResult function');
				if (inFileList($row, result)) {
					return null;
				}
				hideNoFilterResults();
				/*render preview icon, show path beneath filename,
				 show size and last modified date on the right */
				this.updateLegacyMimetype(result);

				var $pathDiv = $('<div class="path"></div>').text(result.path);
				$row.find('td.info div.name').after($pathDiv).text(result.name);

				$row.find('td.result a').attr('href', result.link);

				if (self.fileAppLoaded()) {
					self.fileList.lazyLoadPreview({
						path: result.path,
						mime: result.mime,
						callback: function (url) {
							$row.find('td.icon').css('background-image', 'url(' + url + ')');
						}
					});
				} else {
					// FIXME how to get mime icon if not in files app
					var mimeicon = result.mime.replace('/', '-');
					$row.find('td.icon').css('background-image', 'url(' + OC.imagePath('core', 'filetypes/' + mimeicon) + ')');
					var dir = OC.dirname(result.path);
					if (dir === '') {
						dir = '/';
					}
					$row.find('td.info a').attr('href',
						OC.generateUrl('/apps/files/?dir={dir}&scrollto={scrollto}', {dir: dir, scrollto: result.name})
					);
				}
				return $row;
			};

			this.renderAudioResult = function($row, result) {
				/*render preview icon, show path beneath filename,
				 show size and last modified date on the right
				 show Artist and Album */
				$row = this.renderFileResult($row, result);
				if ($row) {
					$row.find('td.icon').css('background-image', 'url(' + OC.imagePath('core', 'filetypes/audio') + ')');
				}
				return $row;
			};

			this.renderImageResult = function($row, result) {
				/*render preview icon, show path beneath filename,
				 show size and last modified date on the right
				 show width and height */
				$row = this.renderFileResult($row, result);
				if ($row && !self.fileAppLoaded()) {
					$row.find('td.icon').css('background-image', 'url(' + OC.imagePath('core', 'filetypes/image') + ')');
				}
				return $row;
			};


			this.handleFolderClick = function($row, result, event) {
				// open folder
				if (self.fileAppLoaded()) {
					self.fileList.changeDirectory(result.path);
					return false;
				} else {
					return true;
				}
			};

			this.handleFileClick = function($row, result, event) {
				if (self.fileAppLoaded()) {
					self.fileList.changeDirectory(OC.dirname(result.path));
					self.fileList.scrollTo(result.name);
					return false;
				} else {
					return true;
				}
			};

			this.updateLegacyMimetype = function (result) {
				// backward compatibility:
				if (!result.mime && result.mime_type) {
					result.mime = result.mime_type;
				}
			};
			this.setFileList = function (fileList) {
				//console.log('RECOVER search setFileList function');
				this.fileList = fileList;
			};

			OC.Plugins.register('OCA.Search', this);
			//OC.Plugins.register('OCA.Recover.Search', this);
		},
		
		/** eigentliche Filterung der Suchergebnisse 
		 *	durch aufruf von (this.)search in 
		 *  core/core/search/js/search.js - search = search-Object!
		 * ich will jetzt meine search JS nutzen
		**/
		attach: function(search) {
			var self = this;
			// original: search.setFilter('files', function (query) {
			// remove filter here, then no need to adapt core search js
			// core search sets currentApp as default!!!
			// and filter must be set, otherwise instant filtering via searchbox won't work!
			search.setFilter('recover', function (query) {
			//console.log('RECOVER search attach in setFilter query = ' + query);	
				if (self.fileAppLoaded()) {
					self.fileList.setFilter(query);
					if (query.length > 2) {
						//console.log('RECOVER search attach query.length > 2');
						//search is not started until 500msec have passed
						window.setTimeout(function() {
							$('.nofilterresults').addClass('hidden');
						}, 500);
					}
				}
			});

			search.setRenderer('folder', this.renderFolderResult.bind(this));
			search.setRenderer('file',   this.renderFileResult.bind(this));
			search.setRenderer('audio',  this.renderAudioResult.bind(this));
			search.setRenderer('image',  this.renderImageResult.bind(this));

			search.setHandler('folder',  this.handleFolderClick.bind(this));
			search.setHandler(['file', 'audio', 'image'], this.handleFileClick.bind(this));
		}
	};
	OCA.Search.Files = Files;
	// Files Object: OCA.Search.files.fileList.files = specific file objects
	OCA.Search.files = new Files();
})();
