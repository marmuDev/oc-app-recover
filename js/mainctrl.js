/**
 /**
 * ownCloud - Recover - Prepared Angular Search Controller for extended Search
 * functions
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

//(function(window, document, angular, $, OC, csrfToken, undefined){
//(function(window, document, angular, $, OC, csrfToken){
    
    app.controller('SearchController', function($rootScope) {
    //app.controller('SearchController', function() {
        'use strict';
        console.log('in mainctrl.js oben');
        //var searchAttribute = {
        this.search = [
            {
                fileName: 'Name',
                fileType: 'Type',
                fileSizeMin: 'Min Size',
                fileSizeMax: 'Max Size',
                dateStart: 'Date',
                dateEnd: 'Date',
                fileSources: [
                    {
                        id: 1,
                        source: "all"
                    },
                    {
                        id: 2,
                        source: "trashbin"
                    },
                    {
                        id: 3,
                        source: "AFS"
                    },
                    {
                        id: 4,
                        source: "GPFS"
                    },
                    {
                        id: 5,
                        source: "TSM"
                    }
                ]
            }

        ];
        this.addSearch = function(search) {
            alert(search);
        };
        /*
        this.linkNum = $rootScope.linkNum;
        console.log('rootScope linkNum = ' + $rootScope.linkNum);
        console.log('this linkNum = ' + this.linkNum);
        */
    });

 