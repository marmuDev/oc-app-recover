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
$application->registerRoutes($this,
    ['routes' => [
        ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
        // another route for the same function, 
        // but triggered when clicking again on recently backed up in nav -> returning 'blank' template
        ['name' => 'page#recently', 'url' => '/recently_backed_up', 'verb' => 'GET'],
        
        ['name' => 'page#search', 'url' => '/search', 'verb' => 'GET'],
        // how to: http://localhost/core/index.php/apps/recover/?search
        ['name' => 'page#search', 'url' => '/{search}', 'verb' => 'GET',
                'requirements' => ['search' => 'search']],
        ['name' => 'page#help', 'url' => '/help', 'verb' => 'GET'],
        // hack for pushed history state - see search above
        ['name' => 'page#help', 'url' => '/{help}', 'verb' => 'GET',
                'requirements' => ['help' => 'help']],
        
        // functions to get and post data
        ['name' => 'page#get_recently_deleted', 'url' => '/recently', 'verb' => 'GET'],
        // old, now via listBackups
        //array('name' => 'page#list_trash_bin', 'url' => '/trashlist{dir}', 'verb' => 'GET',
        //		'requirements' => array('dir' => '.+')),
        ['name' => 'page#list_backups', 'url' => '/listbackups', 'verb' => 'GET'],//,
            //'requirements' => [
              //  'dir' => '.+'
          //  ],

        /*
        ['name' => 'page#list_backups', 'url' => '/listbackups/{dir}/{source}/{sort}/{sortdirection}', 'verb' => 'GET', 
            'requirements' => [
                //'dir' => '.+'
                'dir' => '[.+]/'
            ],
            'defaults' => [
                'dir' => '/',
                'source' => '',
                'sort' => 'name',
                'sortdirection' => 'asc'
            ]
],*/
        ['name' => 'page#recover', 'url' => '/recover', 'verb' => 'POST']
       // ['name' => 'page#delete', 'url' => '/delete', 'verb' => 'POST']
    ]
]);

