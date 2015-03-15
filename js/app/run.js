/**
 * ownCloud - recover - adapted from OC Core Recover filelist.js
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 */
//.run(function($rootScope, $http, BASE_URL, GetRecDelTrash){
//(function(window, document, angular, $, OC, csrfToken, undefined){
	//app.run(["$rootScope", function($rootScope){
	app.run(function($rootScope){
		'use strict';
		// not marked active at start up!!
	    $rootScope.linkNum = 1;
	})
//})(window, document, angular, jQuery, OC, oc_requesttoken);