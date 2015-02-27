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

$application = new Application();
$application->registerRoutes($this, array(
    'routes' => array(
        array('name' => 'page#index', 'url' => '/', 'verb' => 'GET'),
        array('name' => 'page#get_recently_deleted', 'url' => '/recently', 'verb' => 'GET'),
        array('name' => 'page#list_trash_bin', 'url' => '/listtrash', 'verb' => 'GET')
    )
));

