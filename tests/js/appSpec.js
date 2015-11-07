/**
 * ownCloud - Recover
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
'use strict';
describe('OCA.Recover.App tests', function() {
    var App = OCA.Recover.App;

    beforeEach(function() {
        $('#testArea').append(
            '<div id="app-navigation">' +
            '<ul><li data-id="files"><a>Files</a></li>' +
            '<li data-id="trashbin"><a>Trashbin</a></li>' +
            '</div>' +
            '<div id="app-content">' +
            '<div id="app-content-files" class="hidden">' +
            '</div>' +
            '<div id="app-content-trashbin" class="hidden">' +
            '</div>' +
            '</div>' +
            '</div>'
    );
        App.initialize($('#app-content-trashbin'));
    });
    afterEach(function() {
        App._initialized = false;
        App.fileList = null;
    });

    describe('initialization', function() {
        it('creates a custom filelist instance', function() {
            App.initialize();
            expect(App.fileList).toBeDefined();
            expect(App.navigation).toBeDefined();
            expect(App.fileList.$el.is('#app-content-trashbin')).toEqual(true);
        });

        it('registers custom file actions', function() {
            var fileActions;
            App.initialize();

            fileActions = App.fileList.fileActions;

            expect(fileActions.actions.all).toBeDefined();
            expect(fileActions.actions.all.Recover).toBeDefined();

            expect(fileActions.actions.all.Delete).not.toBeDefined();
            expect(fileActions.actions.all.Rename).not.toBeDefined();
            expect(fileActions.actions.all.Download).not.toBeDefined();

            expect(fileActions.defaults.dir).toEqual('Open');
        });
    });
});
