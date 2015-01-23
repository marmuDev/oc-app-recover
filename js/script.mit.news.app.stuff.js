/**
 * ownCloud - mynewapp
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2014
 */
(function(window, document, angular, $, OC, csrfToken, undefined){
    'use strict';
    
    var linkType = {
        RECENT: 0,
        SEARCH: 1,
        HELP: 2,
        SETTINGS: 3,
        EMPTY: 4
    };
    
    var app = angular.module('mynewapp', []);
    app.config(["$routeProvider", "$provide", "$httpProvider", function($routeProvider, $provide, $httpProvider) {
        'use strict';
        
        $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
        
        $httpProvider.interceptors.push('CSRFInterceptor');
        
        // routing
        var getResolve = function (type) {
            return {
                // request to items also returns feeds
                data: /* @ngInject */ ["$http", "$route", "$q", "BASE_URL", "ITEM_BATCH_SIZE", function (
                    $http, $route, $q, BASE_URL, ITEM_BATCH_SIZE) {
                        
                    var parameters = {
                        type: type,
                        limit: ITEM_BATCH_SIZE
                    };
                    
                    if ($route.current.params.id !== undefined) {
                        parameters.id = $route.current.params.id;
                    }
                
                    var deferred = $q.defer();
                    
                    $http({
                        url: BASE_URL + '/items',
                        method: 'GET',
                        params: parameters
                    }).success(function (data) {
                        deferred.resolve(data);
                    });
                
                    return deferred.promise;
                }]
            };
        };
        
        $routeProvider
            .when('/items', {
                controller: 'ContentController as Content',
                templateUrl: 'part.content.php'//,
                //resolve: getResolve(feedType.SUBSCRIPTIONS),
                //type: feedType.SUBSCRIPTIONS
            })
            .when('/items/starred', {
                controller: 'ContentController as Content',
                templateUrl: 'content.html',
                resolve: getResolve(feedType.STARRED),
                type: feedType.STARRED
            })
            .when('/items/feeds/:id', {
                controller: 'ContentController as Content',
                templateUrl: 'content.html',
                resolve: getResolve(feedType.FEED),
                type: feedType.FEED
            })
            .when('/items/folders/:id', {
                controller: 'ContentController as Content',
                templateUrl: 'content.html',
                resolve: getResolve(feedType.FOLDER),
                type: feedType.FOLDER
            });
        
    }]);
    
    app.run(["$rootScope", "$location", "$http", "$q", "$interval", "Loading", "ItemResource", "FeedResource", "FolderResource", "SettingsResource", "Publisher", "BASE_URL", "FEED_TYPE", "REFRESH_RATE", function ($rootScope, $location, $http, $q, $interval, Loading,
            ItemResource, FeedResource, FolderResource, SettingsResource,
            Publisher, BASE_URL, FEED_TYPE, REFRESH_RATE) {
        'use strict';
        
        var path = $location.path();
        //$http.get(BASE_URL + '/feeds/active').success(function (data) {
        $http.get(BASE_URL).success(function (data) {

            var url;
            // switch mit navi links... siehe linkType oben
            switch (data.activeLink.type) {
                case LINK_TYPE.RECENT:
                    url = '/recent/' + data.activeFeed.id;
                    break;
                case LINK_TYPE.SEARCH:
                    url = '/search/' + data.activeFeed.id;
                    break;
                default:
                    url = '/';
            }
            // only redirect if url is empty or faulty
    //        if (!/^\/items(\/(starred|feeds\/\d+|folders\/\d+))?\/?$/.test(path)) {
    //            $location.path(url);
    //        }

        });    
    }]);

    //app.controller('ContentController', ["selectedLink", function(selectedLink){
    app.controller('ContentController', function(selectedLink){
        //this.link=selectedLink.getLink();
        
    });
    
    //app.controller('NaviController', selectedLink, function(){
    app.controller('NaviController', function(selectedLink){
         this.link = 1;
         this.selectLink = function(linkNum) {
             this.link = linkNum;
             //selectedLink.setLink(linkNum);
         };
         this.isSelected = function(checkLink){
             return this.link === checkLink;
         };
        //this.number = this.link;
    });
    
    //app.controller('RecentController', selectedLink, function(){
    app.controller('RecentController', function(){
         var userArr = {
            name: 'TestUser',
            role: 'Rolle',
            services: 'used Services'
        };
        // recently deleted files
        var recDelFiles = {
            name: 'FileName',
            date: 'date',
            source: 'source'
        };
        this.user = userArr;
        this.recdel = recDelFiles;
    //   selectedLink = this.number;
    });
    
    /*
     * dateStart and dateEnd to specify a period
     */
    app.controller('SearchController', function(){
        var searchAttributes = {
            fileName: 'FileName',
            // calendar GUIwould be great or graph to mark period via mouse
            dateStart: 'date',
            dateEnd: 'date',
            // source could be an array -> list to select sources
            fileSource: 'source'
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

////To get the base URL use:
//var baseUrl = OC.generateUrl('');
//
////Full URLs can be genrated by using:
//var authorUrl = OC.generateUrl('/apps/myapp/authors/1');

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
    
//    app.service('selectedLink', function() {
//        // wenn ich die hier manuell setze gehts!
//        var linkNumber = 1;
//        this.setLink = function (linkNum) {
//            this.linkNumber = linkNum;
//        };
//        this.getLink = function () {
//            return linkNumber;
//        };
//    });