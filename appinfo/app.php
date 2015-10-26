<?php
/**
 * ownCloud - Recover - Create App and add main OC Navigation entry
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

use OCP\App;

$app = new App('recover');
$app->addNavigationEntry(array(
    // the string under which your app will be referenced in owncloud
    'id' => 'recover',
    'appname' => 'recover', 
    // sorting weight for the navigation. The higher the number, the higher
    // will it be listed in the navigation
    'order' => 40,
    // the route that will be shown on startup => pagecontroller->index()
    'href' => \OCP\Util::linkToRoute('recover.page.index'),
    // the icon that will be shown in the navigation
    // this file needs to exist in img/
    'icon' => \OCP\Util::imagePath('recover', 'recover_logo_white_32.svg'),

    // the title of your application. This will be used in the
    // navigation or on the settings page of your app
    'name' => \OC_L10N::get('recover')->t('Recover')
));
