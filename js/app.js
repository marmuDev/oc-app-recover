/**
 * ownCloud - Recover 
 * adapted from OC files_trashbin among others
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
    if (!OCA.Recover) {
        /**
         * Namespace for the recover app
         * @namespace OCA.Recover
         */
        OCA.Recover = {};
    }
    /**
     * @namespace OCA.Recover.App
     * @class OCA.Recover.App
     * 
     * @classdesc init of class, fileActions and Event-Listeners 
     */
     // inherited from files
    //OCA.Recover.App = _.extend({}, OCA.Files.App, {
    // not inherited from files
    OCA.Recover.App = {
        _initialized: false,

        /**
         * Navigation control
         *
         * @member {OCA.Files.Navigation}
         */
        navigation: null,

        /**
         * File list for the "All files" section.
         *
         * @member {OCA.Files.FileList}
         */
        fileList: null,
        
        /**
        * Current data source of filelist
        * @type String
        */
        _currentSource: null,
        /**
        * Current snapshot of filelist
        * @type String
        */
        _currentSnapshot: null,
        
        /**
         * Initialize the app: sets up navgation, view and filelist
         * 
         */
        // trashbin style
        //initialize: function($el) {
        // files app style
        initialize: function() { 
            //console.log('in init from OCA.Recover.App - will init this.fileList = new OCA.Recover.FileList');
            if (this._initialized) {
                    console.log('in init from OCA.Recover.App, initialized already true');
                    return;
            }
            this.navigation = new OCA.Recover.Navigation($('#app-navigation'));
            this.view = new OCA.Recover.View(navigation);
            this.view.renderNavigation();

            this.fileList = new OCA.Recover.FileList(
                    $('#app-content-recover'), {
                            scrollContainer: $('#app-content'),
                            fileActions: this._createFileActions()
                    }
            );
            //console.log('in init of OCA.Recover.App before manual reload');
            // hack to force loading of list -> filelist reload -> $.ajax
            this.fileList.reload();
            this._setupEvents();
            // triggers setActive, shouldn't be triggered twice!
            //this._onPopState(params);
            this._initialized = true;
        },
        /**
         * creating file actions: 'Open' for directories, 'Recover' for all items
         */
        _createFileActions: function() {
            console.log('APP createFileActions beginning');
            var fileActions = new OCA.Files.FileActions();
            //console.log('_createFileAction fileActions = ' +fileActions.actions);
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
                console.log('_createFileAction recover, filename = ' + filename);
                var dir = fileList.getCurrentDirectory();
                var tr = fileList.findFileEl(filename);
                var deleteAction = tr.children("td.date").children(".action.delete");
                deleteAction.removeClass('icon-delete').addClass('icon-loading-small');
                fileList.disableActions();
                
                // similar to filelist onClickRestoreSelected
                var params = {};
                var sources = [];
                var snapshotIds = [];
                sources.push(tr.attr("data-mime"));
                snapshotIds.push(tr.attr("data-etag"));  
                params = {
                    files: JSON.stringify([filename]),
                    dir: dir,
                    sources: JSON.stringify(sources),
                    snapshotIds: JSON.stringify(snapshotIds)
                };
                debugger;
                $.post(OC.generateUrl('/apps/recover/recover'), 
                    params,
                    _.bind(fileList._removeCallback, fileList)
                );
                console.log('RECOVER App RestoreSelected Sources = ' + params.sources);
                console.log('RECOVER App RestoreSelected Snapshots = ' + params.snapshotIds);
            }, t('recover', 'Recover'));
            return fileActions;
        },

        /**
         * Setup events based on URL changes
         * only binding onPopState event to Handler (required for browser history)
         */
        _setupEvents: function() {
            console.log('RECOVER app _setupEvents, onPopState only');
            OC.Util.History.addOnPopStateHandler(_.bind(this._onPopState, this));
            // detect when app changed their current directory
            // obsolete, done by files app
            //$('#app-navigation').on('itemChanged', _.bind(this._onNavigationChanged, this));
        },
        /**
         * Event handler for when the URL changed (e.g. moving back and forth in browser history)
         * conflicting with files onPopState!
         * @param {String} itemId navigation item to be loaded
         */
        _onPopState: function(itemId) {
            //console.log('RECOVER _onPopState anfangs itemId = ' + itemId);
            // get last active ID, the one from history will be set active in here later
            var lastId = OCA.Recover.App.navigation.getActiveLink().id;
            console.log('RECOVER app _onPopState, lastId = ' + lastId + ', current id = ' + itemId);
            if (!this.navigation.itemExists(itemId)) {
                    console.log('RECOVER app _onPopState, if item does not exist, set itemId = "recently_backed_up"');
                    // set initial view (active Link to recover)
                    itemId = 'recently_backed_up';
                    //this.navigation.loadLink(itemId);
            }
            // set active
            OCA.Recover.App.navigation.loadLink(itemId);
            // rerender content
            OCA.Recover.App.view.renderContent(itemId);
            // rerender nav, why isn't that required when clicking on nav and loading new content and nav?
            OCA.Recover.App.view.renderNavigation();
        },
        /**
         * removes the mtime which is appended by OC to every file and folder.
         * need to get the real directory name when clicking on a folder.
         * @param {string} name filename or directory name with appended mtime
         */
        removeMtime: function(name) {
           var pattern = /.d\d{10}/;
           if (pattern.test(name)) {
                console.log("name in removeMtime = " + name);
                console.log('RECOVER filelist changeDir also regex found -> edit targetDir');
                // dirs start with "/" -> 1, files without -> 0
                if (name.charAt(0) === '/') {
                    name = name.substr(1, name.length - 13);
                }
                else {
                    name = name.substr(0, name.length - 13);
                }
                console.log("name in removeMtime = " + name);
                return name;
            }
            // returning original name if pattern not found 
            // -> oc trashbin not supported anymore, may be needed for tubfsss
            
            return name;
        }
    };
})();

/** hack from files/js/app.js 
 * wait for other apps/extensions to register their event handlers and file actions
 * in the "ready" clause, also seems to be working without defer.
 * chrome/ium problem 403 forbidden when init calls fileList.reload()
*/
$(document).ready(function() {
    _.defer(function() { 
        OCA.Recover.App.initialize();
    });
});
