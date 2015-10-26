/**
 * ownCloud - Recover - Create and config Angular App (planned for enxtended Search)
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
var app = angular.module('recover', []);
app.config(function($httpProvider, $provide) {
    'use strict';
    console.log('in config.js oben');
    $httpProvider.defaults.headers.common.requesttoken = oc_requesttoken;
    // how to define in a way it is accessible from everywhere? -> config-service?
    $provide.constant('BASE_URL', OC.generateUrl('/apps/recover'));
    console.log('in config.js ende');
});
