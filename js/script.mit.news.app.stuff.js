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

    var app = angular.module('mynewapp', []).config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
    }]);

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
    
    /* Service for getting data on selected link across several Controllers
     * without root scope or scope inheritance
     * difference between app.service and app.factory?
     */
    app.factory('selectedLink', function(){
        return {number:"info on selected link via service"};
    });

    app.controller('AppController', function(){
        
    });
    
    //app.controller('NaviController', selectedLink, function(){
    app.controller('NaviController', ["selectedLink", function(){
         this.link = 1;
         this.selectLink = function(setLink) {
             this.link = setLink;
         };
         this.isSelected = function(checkLink){
             return this.link === checkLink;
         };
        selectedLink.number = this.link;
    }]);
    
    //app.controller('RecentController', selectedLink, function(){
    app.controller('RecentController', ["selectedLink", function(){
        this.user = userArr;
        this.recdel = recDelFiles;
        this.link = selectedLink.number();
    }]);
    
    app.controller('SettingsController', function(){
        
    });
//})(window, document, angular, jQuery, OC, oc_requesttoken);
//
//(function ($, OC) {
    $(document).ready(function () {
        $('#hello').click(function () {
                alert('Hello from your script file');
        });

        $('#echo').click(function () {
                var url = OC.generateUrl('/apps/mynewapp/echo');
                var data = {
                        echo: $('#echo-content').val()
                };

                $.post(url, data).success(function (response) {
                        $('#echo-result').text(response.echo);
                });

        });
//        $('#notifysettings').click(function () {
//                var url = OC.generateUrl('/apps/mynewapp/notifysettings');
//                $.post(url);
//
//        });

    });
})(window, document, angular, jQuery, OC, oc_requesttoken);
//})(jQuery, OC);

////To get the base URL use:
//var baseUrl = OC.generateUrl('');
//
////Full URLs can be genrated by using:
//var authorUrl = OC.generateUrl('/apps/myapp/authors/1');

