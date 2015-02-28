/**
 * ownCloud - recover
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * jQuery resides in /core/core/js
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 */
(function(window, document, angular, $, OC, csrfToken, undefined){
    'use strict';
    console.log('in script.js oben');
    angular.module('recover', [])
    .config(function($httpProvider, $provide) {
        $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
        // wie wo so definieren, dass alle darauf zugriff haben -> config-service?
        $provide.constant('BASE_URL', OC.generateUrl('/apps/recover'));
    })

    //.run(function($rootScope, $http, BASE_URL, GetRecDelTrash){
    .run(function($rootScope, $http, BASE_URL){
        $rootScope.linkNum = 1;
    })

/** zunächst überflüssig...
    .service('GetRecDelTrash', function($http, BASE_URL) {
        this.getData = function() {
            return $http.get(BASE_URL + '/recently', {cache: 'true'});
        };
    })
*/
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

    // wird nur ausgeführt, 
    // wenn <div ng-controller="RecentController as recentCtrl"> in template!
    .controller('RecentController', function($http, $rootScope, BASE_URL){
        this.text = "init";
        this.items = [];
        console.log('script.js: in recent controller BASE_URL = ' + BASE_URL);
        var self = this;
        
        $http.get(BASE_URL + '/listtrash')
        .success(function(data) {
            // war für einfache auflistung der DB inhalte, wie nun mit trashbin data verfahren?
                //self.items = data;
                // versuche timestamp in user lesbares format zu wandeln
                //self.items[0].timestamp = Math.floor(self.items[0].timestamp / 1000);
                //self.items[0].timestamp = parseInt(self.items[0].timestamp, 10);
            console.log("data nach list trash = \n" + data.files.toSource());    
            //OCA.Recover.FileList.setFiles(data.files);
            
        })
        .error(function() {
            alert("error during http get in RecentController get /listtrash");
        });
        

    })

    .controller('SearchController', function() {
        //var searchAttribute = {
        this.search = [
            {
                fileName: 'FileName',
                fileSizeMin: 'min size',
                fileSizeMax: 'max size',
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
