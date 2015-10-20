/**
 * ownCloud - Recover - filelist
 * adapted from OC Core files_trashbin and files filelist.js 
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
    'use strict';
    var DELETED_REGEXP = new RegExp(/^(.+)\.d[0-9]+$/);
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
     * @classdesc List of backed up files and directories
     *  this.fileList = List of rows (table tbody) = <tbody id="fileList">
     *  rows are added with files/js/filelist.js: add: function(fileData, options)
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
         * Initialize the filelist, bind event listener, set sort attributes,
         * make breadcrumbs and attach plugin
         * @private
         */
        initialize: function() {
            if (this._initialized) {
                    console.log('RECOVER filelist already initialized')
                    return;
            }
            var result = OCA.Files.FileList.prototype.initialize.apply(this, arguments);
            // recover text/icon after selecting file(s)
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
            console.log('RECOVER init filelist');
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
        /**
         * set current source of filelist
         * current source is available in app,
         * since it won't be available in filelist when reloading it
         * source saved in mimetype, would be better to use "source:" 
         * @param {string} source current source of filelist
        */
        _setCurrentSource: function(source) {
            console.log('RECOVER filelist setCurrentSource = ' + source);
            OCA.Recover.App._currentSource = source;
        },
        getCurrentSource: function() {
            return OCA.Recover.App._currentSource;
        },
        /**
         * set current snapshot
         * same limitiations as source, see _setCurrentSource
         * snapshot saved in etag, would be better to use "snapshot:" 
         * @param {string} snapshot current snapshot of filelist
         */
        _setCurrentSnapshot: function(snapshot) {
            console.log('RECOVER filelist setCurrentSnapshot = ' + snapshot);
            OCA.Recover.App._currentSnapshot = snapshot;
        },
        getCurrentSnapshot: function() {
            return OCA.Recover.App._currentSnapshot;
        },
        _createRow: function() {
            // FIXME: MEGAHACK until we find a better solution
            var tr = OCA.Files.FileList.prototype._createRow.apply(this, arguments);
            tr.find('td.filesize').remove();
            //console.log('in createRow  this.files[0].displayName = ' + this.files[0].displayName); 
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
            //console.log('in renderRow fileData.displayName = ' + fileData.displayName); 
            return OCA.Files.FileList.prototype._renderRow.call(this, fileData, options);
        },

        /**
         * Reloads the file list using ajax call
         * reinit of filelist after click on navigation entry "Recently Backed up"
         * is uninitialized when clickin on folder, since reloading will then take place
         *
         * @return ajax call object
         */

        reload: function() {
            console.log('RECOVER filelist reload anfang!');
            var dir = this.getCurrentDirectory();
            if (dir !== '/') {
                var source = this.getCurrentSource();
                var snapshot = this.getCurrentSnapshot();
            }
            var sort = this._sort;
            var sortdirection = this._sortDirection;
            
            //debugger;
            //console.log('in reload  URL = ' + OC.generateUrl('/apps/recover/trashlist')); 
            this._selectedFiles = {};
            this._selectionSummary.clear();
            this.$el.find('.select-all').prop('checked', false);
            this.showMask();
            if (this._reloadCall) {
                    this._reloadCall.abort();
            }
            
            this._reloadCall = $.ajax({
                // back to using data and $_GET vars
                //url : OC.generateUrl('/apps/recover/listbackups/'+ dir + '/' + source + '/' + sort + '/' + sortdirection),
                url: OC.generateUrl('/apps/recover/listbackups'),
                // params should be put in URL for routes + pagecontroller to work!
                // instead of being accessed via PHP $_GET vars
                // route url: '/listbackups{dir}/-/{source}/{sort}/{sortdirection}'
                data: {
                    'dir': dir,
                    'source': source,
                    'sort': sort,
                    'sortdirection': sortdirection,
                    'snapshot': snapshot
                }
               
            });
            console.log('RECOVER filelist reload, current dir = ' + this.getCurrentDirectory() + ', sort = ' + this._sort + ', sortdirection = ' + this._sortDirection + ', source = ' + source);
            var callBack = this.reloadCallback.bind(this);
            return this._reloadCall.then(callBack, callBack);
        },

        reloadCallback: function(result) {
            delete this._reloadCall;
            this.hideMask();
            // result.status undefined -> use statusCode
            if (!result || result.statusCode === '500') {
                // if the error is not related to folder we're trying to load, reload the page to handle logout etc
                if (result.data.error === 'authentication_error' ||
                        result.data.error === 'token_expired' ||
                        result.data.error === 'application_not_enabled'
                ) {
                        console.log('in reloadCallback reload recover app');
                        OC.redirect(OC.generateUrl('apps/recover'));
                }
                OC.Notification.show(result.data.message);
                return false;
            }
               
            // Firewall Blocked request?
            if (result.status === 403) {
                    // Go home
                    this.changeDirectory('/');
                    OC.Notification.showTemporary(t('files', 'This operation is forbidden'));
                    return false;
            }

            // Did share service die or something else fail?
            if (result.status === 500) {
                    // Go home
                    this.changeDirectory('/');
                    OC.Notification.showTemporary(t('files', 'This directory is unavailable, please check the logs or contact the administrator'));
                    return false;
            }   
               
            if (result.status === 404) {
                // go back to root directory
                console.log('in reloadCallback 404 -> go back home');
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
            // sets files-array (files/js/filelist.js)
            this.setFiles(result.data.files);
            //console.log('end of reloadCallback in recover file list (setFiles), files = ' + result.data.files.toSource());
            return true;
        },

        setupUploadEvents: function() {
                // override and do nothing
        },

        /* To do: is kind of broken and totally messy!
         * seems to be responsible for generating links to be used with routes and history
            http://api.owncloud.org/classes/OCP.Util.html#linkTo
            linkTo(string $app, string $file, array $args) : string
            Deprecated 8.1.0 Use \OC::$server->getURLGenerator()->linkTo($app, $file, $args)
                    -> I don't want linkTo($app, $file, $args), since using App Framework and routes!
         * at least there is one "/" too much
                WHAT IS THIS FOR, for now only creates a href link for file and folder,
                which seems not to be used. since using onClickFile event...
         */
        linkTo: function(dir){
            // why encode and replace, when result is again the original dir from above...
            //console.log('RECOVER file list linkTo dir ENCODED = ' + encodeURIComponent(dir));
            //console.log('RECOVER file list linkTo dir ENCODED + Replace = ' + encodeURIComponent(dir).replace(/%2F/g, '/'));
            //console.log('RECOVER linkTo = ' + OC.linkTo('files', 'index.php')+"?view=Recover&dir="+ encodeURIComponent(dir).replace(/%2F/g, '/'));

            //return OC.linkTo('files', 'index.php')+"?view=Recover&dir="+ encodeURIComponent(dir).replace(/%2F/g, '/');
            // hack to replace one of the two "/" (slashes)
            //dir = dir.replace('', '/');

            /* source of problem maybe onClickFile in FILES filelist, further redirection issue
            dir = dir.substr(1, dir.length - 1);
            console.log('dir substr = ' + dir); // -> one slash, ok!
            */
            //dir = dir.substr(1, dir.length - 1);
            //var genUrl = OC.generateUrl('/apps/recoverT/trashlist?dir=' + encodeURIComponent(dir).replace(/%2F/g, '/'));
            var genUrl = OC.generateUrl('/apps/recover/trashlist?dir=' + encodeURIComponent(dir).replace(/%2F/g, '/'));
            console.log('RECOVER linkTo genUrl = ' + genUrl);
            return genUrl;
            // linkToRoute? is not a function! 
                    // seems to be PHP only!
            // without linkTo nothing happens

            // -> redirect to files app
            //var linkTo = OC.linkTo('recover')+"?dir="+ encodeURIComponent(dir).replace(/%2F/g, '/');
            //console.log('RECOVER filelist linkTo = ' + linkTo);
            //return linkTo;

            // redirect error http://localhost/core/index.php/apps/recover/trashlist?dir=//folder1.d1429801627
        },

        updateEmptyContent: function(){
            var exists = this.$fileList.find('tr:first').exists();
            this.$el.find('#emptycontent').toggleClass('hidden', exists);
            this.$el.find('#filestable th').toggleClass('hidden', !exists);
        },

        /**  
         * used when deleting entries from the list, when recover took place
         * 
         * @param {Object} result result of ajax call 
         * @param {string} result.statusCode status code of ajax call          
         * @param {Object} result.data data of ajax call
         * @param {array} result.data.success list of files in case of success
         * @param {array} result.data.error list of files in case of success
         *      
         */
        _removeCallback: function(result) {
            console.log("RECOVER removeCallback oben");
            //if (result.status !== 'success') {
            if (result.statusCode !== '200') {
                    console.log('RECOVER filelist _removeCallback result.statusCode = ' + result.statusCode);
                    // triggers "unnecessary" Error Message...
                    // t not useable since transiflex translation not implemented?
                    OC.dialogs.alert(result.data.message, t('recover', 'Error'));
            }
            else {
                OC.dialogs.alert(result.data.message, t('recover', 'Info'));
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
        /* only used, when (multiple) files have been selected 
         * NOT when directly clicking 'recover'! ==> App: fileActions.register "recover"
         */
        _onClickRestoreSelected: function(event) {
            event.preventDefault();
            var self = this;
            var allFiles = this.$el.find('.select-all').is(':checked');
            var files = [];
            var dir = this.getCurrentDirectory();
            var sources = [];
            var snapshotIds = [];
            var params = {};
            this.disableActions();
            // loop has to get source and snapshot of file
            // allfiles obsolete (trashbin) was removed
            files = _.pluck(this.getSelectedFiles(), 'name');
            
            // checking for every file 
            //  good: files may be from different sources
            //  bad: costs performance, when only one source has to be recovered
                        
            // only if dir = '/' and files.lenght > 1 
            //  -> only in this case several sources and snapshots are possible
            if (dir === '/' && files.length > 1) {
                for (var i = 0; i < files.length; i++) {
                    // delete stuff may be obsolete
                    var deleteAction = this.findFileEl(files[i]).children("td.date").children(".action.delete");
                    deleteAction.removeClass('icon-delete').addClass('icon-loading-small');
                    // otherwise source and snapshot are the same within a directory
                    // data-etag = snapshot, data-mime=source

                    // Returns the tr element for a given file name
                    // -> OCA.Recover.App.fileList.findFileEl("snap_3_file3.d1443271478").attr("data-etag")
                    // if source tubfssss, push source, get snapshotId
                    if (this.findFileEl(files[i]).attr("data-mime") === 'tubfsss'){
                        console.log('RECOVER filelist onClickRestoreSelected, tubfssss, ')
                        sources.push(this.findFileEl(files[i]).attr("data-mime"));
                        snapshotIds.push(this.findFileEl(files[i]).attr("data-etag"));
                    }
                }
            }
            else {
                sources.push(this.findFileEl(files[0]).attr("data-mime"));
                snapshotIds.push(this.findFileEl(files[0]).attr("data-etag"));
            }
            params = {
                files: JSON.stringify(files),
                dir: dir,
                sources: JSON.stringify(sources),
                snapshotIds: JSON.stringify(snapshotIds)
            };
            console.log('RECOVER filelist RestoreSelected currentDir = ' + dir);
            console.log('RECOVER filelist RestoreSelected files = ' + files);
            console.log('RECOVER filelist RestoreSelected Sources = ' + params.sources);
            console.log('RECOVER filelist RestoreSelected Snapshots = ' + params.snapshotIds);
            
            $.post(OC.generateUrl('/apps/recover/recover'), 
                params,
                function(result) {
                    // allfiles obsolete, was only implemented for oc trash bin
                    // show message after successful recovery of file(s) 
                    // now only in removeCallback, since allfiles was removed
                    self._removeCallback(result);
                }
            );
        },
        /* delete not implemented, just deactivate
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
        */
        _onClickFile: function(event) {
            // need to get source of dir, if clicked file is dir
            //var type = this.fileActions.getCurrentType();
            // always the old value, is one click behind
            //console.log('RECOVER filelist _onClick this.fileActions.getCurrentType() = ' + this.fileActions.getCurrentType());
            var $tr = $(event.target).closest('tr');
            this.fileActions.currentFile = $tr.find('td');
            //console.log('current file/dir = ' +this.fileActions.currentFile.toString());
            // not used except for logging!
            var type = this.fileActions.getCurrentType();
            //console.log('RECOVER _onClickFile type = ' + type);
            if (type === 'dir') {
                console.log('RECOVER filelist _onClickFile type = dir' );
            }
            // trying this in reload above! 
            // -> source important here and in changeDir, set parentId (snapshot) only in here
            var mimeType = this.fileActions.getCurrentMimeType();
            if (mimeType === 'ext4' || 'gpfsss' || 'tubfsss') {
                console.log('RECOVER filelist _onClickFile mimeType = ' + mimeType);
                // look at mime above, would this be possible for source too??! 
                var snapshot = this.fileActions.currentFile.parent().attr('data-etag');
                this._setCurrentSnapshot(snapshot);
            }
            // redundant?!
            var mime = $(this).parent().parent().data('mime');
            // if not clicking on dir? (keep, but never seems to be the case)
            if (mime !== 'httpd/unix-directory') {
                // deprecated? there was something in the JS console,     
                // getPreventDefault() sollte nicht mehr verwendet werden. Verwenden Sie stattdessen defaultPrevented. jquery.min.js:5:0
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

        getDownloadUrl: function() {
            // no downloads
            return '#';
        },

        enableActions: function() {
            //console.log('in enableActions');
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
        },
        /**
        *  Changes the current directory and reloads the file list.
        * @param targetDir target directory (non URL encoded)
        * @param changeUrl false if the URL must not be changed (defaults to true)
        * @param {boolean} force set to true to force changing directory
        */
       changeDirectory: function(targetDir, changeUrl, force) {
           console.log('RECOVER filelist changeDirectory, targetDir = ' + targetDir);     
           var self = this;
                var currentDir = this.getCurrentDirectory();
                targetDir = targetDir || '/';
                if (!force && currentDir === targetDir) {
                       console.log('RECOVER filelist changeDirectory, !force && currentDir === targetDir');
                       console.log('RECOVER filelist changeDirectory, currentDir = ' + currentDir + ' targetDir = ' + targetDir);
                       return;
                }
                // get source -> undefined won't work
                //var source = this.getSource();
                // using MimeType in data.files to note (external) source
                var source = this.fileActions.getCurrentMimeType();
                // future proof (long-term reliability)???
                if (source === "application/octet-stream") {
                    this._setCurrentSource('octrash');
                } else {
                    this._setCurrentSource(source);
                }
                source = this.getCurrentSource();  
                // edit targetDir: if ".d1437995265" and files from external source requested, remove last 12 chars .d1437995265 (mtime)
                console.log('RECOVER filelist changeDirectory, targetDir before source check = ' + targetDir + ', source = ' + source);
                // if in root, directories got .dmtime at the end of dir name
                // To do: check would be obsolete, if that never is the case
                if (source !== 'octrash' && currentDir === '/') {
                    // exernal source -> edit targetDir
                    targetDir = OCA.Recover.App.removeMtime(targetDir);
                }
                this._setCurrentDir(targetDir, changeUrl);
                this.reload().then(function(success){
                    if (!success) {
                        console.log('RECOVER filelist changeDirectory, this.reload no success -> changeDirectory(currentDir, true), currentDir = ' + currentDir);
                        self.changeDirectory(currentDir, true);
                    }
                    console.log('RECOVER filelist changeDirectory, this.reload success');
                });
               console.log('RECOVER filelist changeDirectory, targetDir = ' + targetDir + ' USES getCurrentMimeType for SOURCE!');
       }
    });
    OCA.Recover.FileList = FileList;
})();