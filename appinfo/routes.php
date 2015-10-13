<?php
/**
 * ownCloud - Recover
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
        ['name' => 'page#list_backups', 'url' => '/listbackups', 'verb' => 'GET'],
        ['name' => 'page#recover', 'url' => '/recover', 'verb' => 'POST']
    ]
]);

