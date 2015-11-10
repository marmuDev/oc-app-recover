/**
 * ownCloud - Recover - adapted from OC Core Files search.js
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program. If not, see <http://www.gnu.org/licenses/>
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
         *
         */
        initialize: function() {
            var self = this;
            //console.log('RECOVER search init');
            this.recoverAppLoaded = function() {
                    return !!OCA.Recover && !!OCA.Recover.App;
            };
            function inFileList($row, result) {
                    //console.log('RECOVER search inFileList function');
                    if (! self.recoverAppLoaded()) {
                            console.log('RECOVER search Recover App not loaded');
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

                    if (self.recoverAppLoaded()) {
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


            this.handleFolderClick = function($row, result, event) {
                    // open folder
                    if (self.recoverAppLoaded()) {
                            self.fileList.changeDirectory(result.path);
                            return false;
                    } else {
                            return true;
                    }
            };
            /* TO DO: after click on file go to according directory and scroll to file
            this.handleFileClick = function($row, result, event) {
                    if (self.recoverAppLoaded()) {
                            self.fileList.changeDirectory(OC.dirname(result.path));
                            self.fileList.scrollTo(result.name);
                            return false;
                    } else {
                            return true;
                    }
            };
            */

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
        },

        /** eigentliche Filterung der Suchergebnisse 
         *	durch aufruf von (this.)search in 
         *  core/core/search/js/search.js - search = search-Object!
         * ich will jetzt meine search JS nutzen
        **/
        attach: function(search) {
            var self = this;
            console.log('Search attach anfang');
            // original: search.setFilter('files', function (query) {
            // remove filter here, then no need to adapt core search js
            // core search sets currentApp as default!!!
            // and filter must be set, otherwise instant filtering via searchbox won't work!
            search.setFilter('recover', function (query) {
                    if (self.recoverAppLoaded()) {
                            self.fileList.setFilter(query);
                            // files not matching filter will be hidden after query length>2 and after 500msec have passed
                            if (query.length > 2) {
                                window.setTimeout(function() {
                                    $('.nofilterresults').addClass('hidden');
                                }, 500);
                            }
                    }
            });

            search.setRenderer('folder', this.renderFolderResult.bind(this));
            search.setRenderer('file',   this.renderFileResult.bind(this));

            search.setHandler('folder',  this.handleFolderClick.bind(this));
            console.log('SEARCH vor altering css');
            $('#status').css('position', 'relative');
        }
    };
    OCA.Search.Files = Files;
    // Files Object: OCA.Search.files.fileList.files = specific file objects
    OCA.Search.files = new Files();
})();
