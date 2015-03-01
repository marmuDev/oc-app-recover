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
app.service('dataService', function($http) {
    this.getData = function() {
        $http.get(BASE_URL + '/listtrash')
            .success(function(data) {
                console.log("trashData in dataService = \n" + data.files.toSource()); 
            })
            .error(function() {
                alert("error during http get in RecentController get /listtrash");
            });
    }
});

/**
app.controller('AngularJSCtrl', function($scope, dataService) {
    $scope.data = null;
    dataService.getData().then(function(dataResponse) {
        $scope.data = dataResponse;
    });
});
*/