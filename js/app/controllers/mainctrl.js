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
     
    //var TrashList = function($el, options)
    var TrashList =  function ($el, options) {
        OCA.Recover.FileList.prototype.initialize.apply(this, arguments);
        //this.initialize($el, options);
    };
    //TrashList.prototype = Object.create(Resource.prototype);
    TrashList.prototype = Object.create(FileList.prototype);
    **/
    console.log('in script.js oben');
        
    

/** zunächst überflüssig...
    .service('GetRecDelTrash', function($http, BASE_URL) {
        this.getData = function() {
            return $http.get(BASE_URL + '/recently', {cache: 'true'});
        };
    })
*/
    app.controller('ContentController', function($rootScope){
    })
    /** do not hide any content for now!
    app.controller('NaviController', function($rootScope){
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
    app.controller('SearchController', function() {
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
