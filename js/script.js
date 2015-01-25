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

    //var app = angular.module('mynewapp',  ['ngRoute', 'ngSanitize']);
    var app = angular.module('mynewapp', []);
    //app.config(["$routeProvider", "$provide", "$httpProvider", function($routeProvider, $provide, $httpProvider) {
    app.config(["$httpProvider", "$provide", function($httpProvider, $provide) {
        'use strict';
        
        $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
        //$httpProvider.interceptors.push('CSRFInterceptor');
        
        // constants
        /**
         * To send requests to ownCloud
         * the base URL where ownCloud is currently running is needed.
         * To get the base URL use:
         */
        $provide.constant('BASE_URL', OC.generateUrl('/apps/mynewapp'));
        
        
       
    }]);
    /**
     * why parameters in [] 
     *  You should have a string for each service you use in your function
     *  and why in () of function?
     *  AngularJS will map the functions named with the strings to the parameters
     *  
     * how to use $scope?
     *  
     */
    app.run(["$rootScope", "$http", "BASE_URL", "GetRecDelTrash",
        function($rootScope, $http, BASE_URL, GetRecDelTrash){
        // init linkNum
        $rootScope.linkNum = 1;
        //$rootScope.items = "init";
        //$rootScope.items = $scope.items;
        // kennt OC.Router nicht!
        //var url = OC.Router.generate('mynewapp.page.get_recently_deleted');
        // kein plan wo das landet... andere benutzen das zum debuggen 
        console.log(BASE_URL + '/recently');
        /*
         * jetzt in recent controller noch extra service
        GetRecDelTrash.getData().then(function(data) {
            $rootScope.items = data;
            $rootScope.apply();
           // rootScope.items set here and holds correct values, but bot below
           // alert($rootScope.items);
        });
        */
        // why is rootScope.items undefined here?
        // careful, async communication, publisher and subscriber??
        // why isn't view updated
        //alert($rootScope.items);
        
    }]);
    
    // direkt in recent controller, ohne diesen extra service versuchen
    app.service('GetRecDelTrash', ["$q", "$http", "BASE_URL", 
        function($q, $http, BASE_URL) {
        /**
         * $http service will happily cache your response data,
         * so you don't have to. Note that you need to retrieve the promise 
         * from your deferred object to make this work
         * 
         */
        'use strict';
            return {
            getData: function() {
            var deferred = $q.defer();
            // http get request to trigger route -> function in pagecontroller.php
            $http.get(BASE_URL + '/recently', {cache: 'true'} ).
                success(function(data) {
                    /**
                     * Most browsers support JSON.parse(), 
                     * which is defined in ECMA-262 5th Edition 
                     * (the specification that JS is based on)
                     * 
                     * already using jQuery, there is a $.parseJSON function 
                     * that maps to JSON.parse...
                     * performs additional, unnecessary checks 
                     * that are also performed by JSON.parse, 
                     * so for the best all round performance...
                     */

                    //$rootScope.items = JSON && JSON.parse(data) || $.parseJSON(data);
                    deferred.resolve(JSON && JSON.parse(data) || $.parseJSON(data));

                }).
                error(function() {
                    alert("error during http get in app.run get /recently");

                });
                // here rootScope was already undefined! http.get data in rootScope ging nicht!
                return deferred.promise;
            }
        };    
    }]);

    app.controller('ContentController',  function($rootScope){
        //this.link=$rootScope.linkNum;
    });
    
    app.controller('NaviController', function($rootScope){
         this.link = 1;
         this.selectLink = function(linkNum) {
            this.link = linkNum;
            $rootScope.linkNum = linkNum;
         };
         this.isSelected = function(checkLink){
            return this.link === checkLink;
         };
        //this.number = this.link;
    });
    
    // a way to use global vars
    //app.value('items', window.itemsFromPHP);

    
    // get user recently deleted files from trash bin
    //app.controller('RecentController', ['items', function(items){
    app.controller('RecentController', 
        ["$http", "$rootScope", "BASE_URL", "$q",
        function($http, $rootScope, BASE_URL, $q){
            this.text = "init";
            //var recent = this;
            var self = this;
            //recent.items = [];
            self.items = [];
            //var deferred = $q.defer();
            $http.get(BASE_URL + '/recently', {cache: 'true'} ).
                success(function(data) {
                    /**
                     * Most browsers support JSON.parse(), 
                     * which is defined in ECMA-262 5th Edition 
                     * (the specification that JS is based on)
                     * 
                     * already using jQuery, there is a $.parseJSON function 
                     * that maps to JSON.parse...
                     * performs additional, unnecessary checks 
                     * that are also performed by JSON.parse, 
                     * so for the best all round performance...
                     */
                    
                    // Teilt man dem $http-Service mit, dass er JSON-Daten 
                    // abrufen soll, werden diese automatisch in 
                    // JavaScript-Objekte und -Arrays dekodiert. -> wie???

                    //$rootScope.items = JSON && JSON.parse(data) || $.parseJSON(data);
                    //deferred.resolve(JSON && JSON.parse(data) || $.parseJSON(data));
                    // recent.item should automatically be updated, 
                    // when data is available, but this does not seem to work
                    //recent.items = JSON && JSON.parse(data) || $.parseJSON(data);
                    // JSON.parse nicht notwendig
                    self.items = data;
                    // daten da... so wieder mit "\"
                    //alert(self.items);

                }).
                error(function() {
                    alert("error during http get in app.run get /recently");

                });
            // hier noch leer!
           //alert(self.items);
        /** 
         * siehe    app.factory('Resource'...       und
         *          app.factory('ItemResource'...   in:
         * https://github.com/owncloud/news/blob/master/js/build/app.js
         */
        
        // $rootScope.items ist hier undefined
        //alert($rootScope.items);
        //
//this.items = angular.fromJson($rootScope.items);
        //alert($rootScope.items);
//        var userArr = {
//            name: 'TestUser',
//            role: 'Rolle',
//            services: 'used Services'
//        };
//        // recently deleted files
//        
//        this.user = userArr;
        
    }
    ]
    );
    
    
    /*
     * dateStart and dateEnd to specify a period
     * dateStartMin should be limited to 1 year in past or 6 months
     * ->
     * dateEndMax should be today
     * new Date().toISOString().split("T")[0]; // "2014-09-30"
     * 
     */
    app.controller('SearchController', function(){
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
    });
    
    app.controller('HelpController', function(){
        
    });
    
    app.controller('SettingsController', function(){
        
    });
    
})(window, document, angular, jQuery, OC, oc_requesttoken);    
    
//})(window, document, angular, jQuery, OC, oc_requesttoken);
//
//(function ($, OC) {
//    $(document).ready(function () {
//        $('#hello').click(function () {
//                alert('Hello from your script file');
//        });
//
//        $('#echo').click(function () {
//                var url = OC.generateUrl('/apps/mynewapp/echo');
//                var data = {
//                        echo: $('#echo-content').val()
//                };
//
//                $.post(url, data).success(function (response) {
//                        $('#echo-result').text(response.echo);
//                });
//
//        });
////        $('#notifysettings').click(function () {
////                var url = OC.generateUrl('/apps/mynewapp/notifysettings');
////                $.post(url);
////
////        });
//
//    });

//})(jQuery, OC);

//    app.service('selectedLink', function($rootScope) {
//        // if I set the number here manually, it works!
//        var linkNumber = 1;
//        this.setLink = function (linkNum) {
//            this.linkNumber = linkNum;
//            $rootScope.linkNum = linkNum;
//        };
//        this.getLink = function () {
//            return linkNumber;
//        };
//    });

    /* Service for getting data on selected link across several Controllers
     * without root scope or scope inheritance
     * difference between app.service and app.factory?
     * 
     * in IRC fragen wie factory + navi + content!
     * I got a naviCtrl to mark which link was clicked.
     * now I'd like to pass that info to my contentCtrl to 
     * load the corresponding content. 
     * tried it via app.factory + using ng-module in both divs. 
     * 
     */
//    app.factory('selectedLink', function(){
//        //'use strict';
//        //var number;
//        return {number:"info on selected link via service"};
//    });
    
