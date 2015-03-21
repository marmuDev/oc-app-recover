<?php
/**
 * ownCloud - recover
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 */

/** the news app way
return ['routes' => [
	['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
	['name' => 'page#get_recently_deleted', 'url' => '/recently', 'verb' => 'GET']
	['name' => 'page#list_trash_bin', 'url' => '/listtrash', 'verb' => 'GET']
]];
*/

namespace OCA\Recover\AppInfo;

$application = new Recover();
$application->registerRoutes($this, array(
    'routes' => array(
        // NAVIGATION
        // init
        array('name' => 'page#index', 'url' => '/', 'verb' => 'GET'),
        // another route for the same function, 
        // but triggered when clicking again on recently deleted in nav
        array('name' => 'page#recently', 'url' => '/recently_deleted', 'verb' => 'GET'),
        array('name' => 'page#search', 'url' => '/search', 'verb' => 'GET'),
        array('name' => 'page#help', 'url' => '/help', 'verb' => 'GET'),
        
        // functions to get and post data
        array('name' => 'page#get_recently_deleted', 'url' => '/recently', 'verb' => 'GET'),
        array('name' => 'page#list_trash_bin', 'url' => '/trashlist{dir}', 'verb' => 'GET',
        		'requirements' => array('dir' => '.+')),
        array('name' => 'page#recover', 'url' => '/recover', 'verb' => 'POST'),
        array('name' => 'page#delete', 'url' => '/delete', 'verb' => 'POST')
    )
));

