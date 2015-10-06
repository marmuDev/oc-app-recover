/**
 * ownCloud - recover - Recover - adapted from trashbin among others
 *	
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015

	script.js in app.js, config.js, run.js und 
	weitere bestandteile wie controller etc. unterteilen
*/
(function() {
    'use strict';
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
     // inherited from files
    //OCA.Recover.App = _.extend({}, OCA.Files.App, {
    // not inherited from files
    OCA.Recover.App = {
        // not inherited from files
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
        * Current source of filelist
        * @type String
        */
        _currentSource: null,
        /**
        * Current snapshot of tubfs filelist
        * @type String
        */
        _currentSnapshot: null,

        initialize: function($el) {
            //console.log('in init from OCA.Recover.App - will init this.fileList = new OCA.Recover.FileList');
            if (this._initialized) {
                    console.log('in init from OCA.Recover.App, initialized already true');
                    return;
            }
            this.navigation = new OCA.Recover.Navigation($('#app-navigation'));
            this.view = new OCA.Recover.View(navigation);
            this.view.renderNavigation();

            this.fileList = new OCA.Recover.FileList(
                    $('#app-content-trashbin'), {
                            scrollContainer: $('#app-content'),
                            fileActions: this._createFileActions()
                    }
            );
            //console.log('in init of OCA.Recover.App before manual reload');
            // hack to force loading of list -> myfilelist reload -> $.ajax
            this.fileList.reload();
            this._setupEvents();
            /*
            params = 	{
                                            dir: '/',
                                            view: 'recently_deleted'
                                    }
            // triggers setActive, shouldn't be triggered twice!
            this._onPopState(params);
            */
            this._initialized = true;
        },

        // adapt according to file source and coresponding functions etc.
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
                /* not required, filename is ok
                if (fileList.getCurrentSource() !== 'octrash') {
                    filename = OCA.Recover.App.removeMtime(filename);
                    console.log('APP register recover, filename = ' + filename);
                }
                */
                // if root-dir do similar to filelist onClickRestoreSelected
                var params = {};
                var sources = [];
                var snapshotIds = [];
                if (dir === "/") { 
                    sources = tr.attr("data-mime");
                    console.log('APP register recover, source = ' + sources);
                    snapshotIds = tr.attr("data-etag");
                    console.log('APP register recover, snapshot = ' + snapshotIds);
                    params = {
                        files: JSON.stringify([filename]),
                        dir: dir,
                        sources: sources,
                        snapshotIds: snapshotIds
                    };
                }
                else {
                    params = {
                        files: JSON.stringify([filename]),
                        dir: dir,
                        sources: this._currentSource,
                        snapshotIds: this._currentSnapshot
                    };
                }
                // AJAX path for PHP!!! => now trigger route + controller
                //$.post(OC.filePath('recover', 'ajax', 'recover.php'), {    
                $.post(OC.generateUrl('/apps/recover/recover'), 
                    params,
                    _.bind(fileList._removeCallback, fileList)
                );
                console.log('RECOVER filelist RestoreSelected Sources = ' + params.sources);
                console.log('RECOVER filelist RestoreSelected Snapshots = ' + params.snapshotIds);
            }, t('recover', 'Recover'));

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
                            $actionLink.attr('original-title', t('recover', 'Delete permanently'));
                            $actionLink.children('img').attr('alt', t('recover', 'Delete permanently'));
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
                            // adapt to route + controller
                            // maybe further adapted for other file sources than OC
                            //$.post(OC.filePath('recover', 'ajax', 'delete.php'), {
                            $.post(OC.generateUrl('/apps/recover/delete'), {
                                            files: JSON.stringify([filename]),
                                            dir: fileList.getCurrentDirectory()
                                    },
                                    _.bind(fileList._removeCallback, fileList)
                            );
                    }
            });
            return fileActions;
        },

        /**
         * Setup events based on URL changes
         */
        _setupEvents: function() {
            console.log('RECOVER app _setupEvents, onPopState only');
            OC.Util.History.addOnPopStateHandler(_.bind(this._onPopState, this));
            // detect when app changed their current directory
            // obsolete, done by files app
            //$('#app-navigation').on('itemChanged', _.bind(this._onNavigationChanged, this));
        },
        /**
         * Event handler for when the URL changed (e.g. moving back and forth in history)
         * conflicting with files onPopState!
         */
        _onPopState: function(itemId) {
            //console.log('RECOVER _onPopState anfangs itemId = ' + itemId);
            // get last active ID, the one from history will be set active in here later
            var lastId = OCA.Recover.App.navigation.getActiveLink().id;
            console.log('RECOVER app _onPopState, lastId = ' + lastId + ', current id = ' + itemId);
            if (!this.navigation.itemExists(itemId)) {
                    console.log('RECOVER app _onPopState, if item does not exist, set itemId = "recently_deleted"');
                    // set initial view (active Link to recover)
                    itemId = 'recently_deleted';
                    //this.navigation.loadLink(itemId);
            }
            // set active
            OCA.Recover.App.navigation.loadLink(itemId);
            // rerender content
            OCA.Recover.App.view.renderContent(itemId);
            // rerender nav, why isn't that required when clicking on nav and loading new content and nav?
            OCA.Recover.App.view.renderNavigation();
        },
        removeMtime: function(name) {
           var pattern = /.d\d\d\d\d\d\d\d\d\d\d/;
           if (pattern.test(name)) {
                //console.log("name in removeMtime = " + name);
                //console.log('RECOVER filelist changeDir also regex found -> edit targetDir');
                // dirs start with "/" -> 1, files without -> 0
                if (name.charAt(0) === '/') {
                    name = name.substr(1, name.length - 13);
                }
                else {
                    name = name.substr(0, name.length - 13);
                }
                //console.log("name in removeMtime = " + name);
                return name;
            }
        }
    };
})();




// hack from files/js/app.js 
$(document).ready(function() {
	// wait for other apps/extensions to register their event handlers and file actions 
	// in the "ready" clause
	// also seems to be working with out defer
	//OCA.Recover.App.initialize();
	_.defer(function() { 
			OCA.Recover.App.initialize();
	});
});
