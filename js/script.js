/**
 * ownCloud - mynewapp
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * jQuery resides in /core/core/js
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2014
 */
(function(window, document, angular, $, OC, csrfToken, undefined){
    'use strict';

    angular.module('mynewapp', [])
    .config(function($httpProvider, $provide) {
        $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
        $provide.constant('BASE_URL', OC.generateUrl('/apps/mynewapp'));
    })

    .run(function($rootScope, $http, BASE_URL, GetRecDelTrash){
        $rootScope.linkNum = 1;
        console.log(BASE_URL + '/recently');
    })

    .service('GetRecDelTrash', function($http, BASE_URL) {
        this.getData = function() {
            return $http.get(BASE_URL + '/recently', {cache: 'true'});
        };
    })

    .controller('ContentController',  function($rootScope){
    })

    .controller('NaviController', function($rootScope){
         this.link = 1;
         this.selectLink = function(linkNum) {
            this.link = linkNum;
            $rootScope.linkNum = linkNum;
         };
         this.isSelected = function(checkLink){
            return this.link === checkLink;
         };
    })

    .controller('RecentController', function($http, $rootScope, BASE_URL){
        this.text = "init";
        this.items = [];

        var self = this;
        $http.get(BASE_URL + '/recently', {cache: 'true'} )
        .success(function(data) {
            self.items = data;
        })
        .error(function() {
            alert("error during http get in app.run get /recently");
        });
    })

    .controller('SearchController', function() {
        //var searchAttribute = {
        this.search = [
            {
                fileName: 'FileName',
                fileSizeMin: 'min size',
                fileSizeMax: 'max size',
                // calendar GUIwould be great or graph to mark period via mouse
                dateStart: 'date',
                dateEnd: 'date',
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
    })

    .controller('HelpController', function () {

    })

    .controller('SettingsController', function () {

    });

})(window, document, angular, jQuery, OC, oc_requesttoken);
