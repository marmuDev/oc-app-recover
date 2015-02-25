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

use OCP\App;

// taken from original trashbin app.php
// what for?
//$l = \OC::$server->getL10N('files_trashbin');

// register hooks 
\OCA\Files_Trashbin\Trashbin::registerHooks();

$app = new App('mynewapp');
$app->addNavigationEntry(array(
    // the string under which your app will be referenced in owncloud
    'id' => 'mynewapp',


    // taken from files_trashbin (app)
    "appname" => 'recover', 
    //"script" => 'list.php',

    // sorting weight for the navigation. The higher the number, the higher
    // will it be listed in the navigation
    'order' => 40,

    // the route that will be shown on startup => pagecontroller->index()
    'href' => \OCP\Util::linkToRoute('mynewapp.page.index'),
    // in trashbin app.php: ""script" => 'list.php',"

    // the icon that will be shown in the navigation
    // this file needs to exist in img/
    //'icon' => \OCP\Util::imagePath('mynewapp', 'app.svg'),
    'icon' => \OCP\Util::imagePath('mynewapp', 'recover_logo_white_32.svg'),

    // the title of your application. This will be used in the
    // navigation or on the settings page of your app
    'name' => \OC_L10N::get('mynewapp')->t('Recover')
));
