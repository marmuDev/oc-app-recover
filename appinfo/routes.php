<?php
/**
 * ownCloud - mynewapp
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2014
 */

namespace OCA\MyNewApp\AppInfo;

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */

// application is used in documentation for app dev with API
// but I inherit it from AppFramework\App
$application = new Application();

$application->registerRoutes($this, ['routes' => [
    // index equals recently deleted for now
    ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
    [
        'name' => 'page#get_recently_deleted', 
        'url' => '/recently', 
        'verb' => 'GET'
    ],
    ['name' => 'page#do_echo', 'url' => '/echo', 'verb' => 'POST'],
    ['name' => 'page#do_echo', 'url' => '/echo', 'verb' => 'POST'],
   // ['name' => 'page#find_recent', 'url' => '/recent', 'verb' => 'GET'],
    [
        'name' => 'page#show_notify_settings',
        'url' => '/notifysettings',
        'verb' => 'GET'
    ],
]]);


