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
    
    
    /** trashbin filelist (later this could become a service "TrashResource")
     *  adapted from trashbin filelist.js / myfilelist.js
     */
    console.log('in mainctrl.js oben');
/** zunächst überflüssig...
    .service('GetRecDelTrash', function($http, BASE_URL) {
        this.getData = function() {
            return $http.get(BASE_URL + '/recently', {cache: 'true'});
        };
    })
*/
    app.controller('ContentController', function($rootScope){
    })
    
    // could use http.get here instead of generating links for template...
    app.controller('NaviController', function($rootScope){
        // should be covered by app.run... but does not work!
        //this.link = 1;
        // werden richtig gesetzt, aber active funzt nicht!
        this.selectLink = function(linkNum) {
            this.linkNum = linkNum;
            //$rootScope.linkNum = linkNum;
            console.log("linkNum = " + linkNum);
            /*
            this.url = OC.Router.generate('recover_index');
            so geht das nicht, da links erst bei click generiert,
            da müssen die aber schon feststehen!
            oder statt routen, wie vorher einfach inhalte aus template ein- und ausblenden?

            switch(linkNum) {
                case 1:
                    this.url = OC.generateUrl('/apps/recover');
                    break;
                case 2:
                    this.url = OC.generateUrl('/apps/recover/search');
                    break;
                case 3:
                    this.url = OC.generateUrl('/apps/recover/help');
                    break;
                default:
                    this.url = OC.generateUrl('/apps/recover');
                    break;
            }
            console.log('url = ' + this.url);
            */
         };
         // if not run, link won't know if it's active! how did this work before???
         this.isSelected = function(checkLink){
            console.log("isSelected = " + checkLink);
            return this.linkNum === checkLink;
         };
    })
    /** 
    // wird nur ausgeführt, 
    // wenn <div ng-controller="RecentController as recentCtrl"> in template!
    
    app.controller('RecentController', function($http, $rootScope, BASE_URL){
        this.text = "init";
        this.items = [];
        console.log('script.js: in recent controller BASE_URL = ' + BASE_URL);
        var self = this;

        /**
        $http.get(BASE_URL + '/listtrash')
        .success(function(data) {
            // war für einfache auflistung der DB inhalte, wie nun mit trashbin data verfahren?
                //self.items = data;
                // versuche timestamp in user lesbares format zu wandeln
                //self.items[0].timestamp = Math.floor(self.items[0].timestamp / 1000);
                //self.items[0].timestamp = parseInt(self.items[0].timestamp, 10);
            console.log("data nach list trash = \n" + data.files.toSource());    
            return data.files.toSource();
        })
        .error(function() {
            alert("error during http get in RecentController get /listtrash");
        });
        
    })
**/
    app.controller('SearchController', function($rootScope) {
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
        this.linkNum = $rootScope.linkNum;
        console.log('rootScope linkNum = ' + $rootScope.linkNum);
        console.log('this linkNum = ' + this.linkNum);
    })

    .controller('HelpController', function () {

    })

    .controller('SettingsController', function () {

    });

})(window, document, angular, jQuery, OC, oc_requesttoken);
