<?php
/**
 * ownCloud - Recover - main template
 * TO DO: 
 *  only load CSS an JS needed for specific template -> when it is need
 *  how to load, init angular search stuff, after clicking on "Search" 
 *  in App-Navigation?
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
    OCP\Util::addStyle('files', 'files');
    OCP\Util::addStyle('files', 'upload');
    OCP\Util::addStyle('files', 'mobile');
    OCP\Util::addStyle('files_trashbin', 'trash');
    
    OCP\Util::addScript('files', 'app');
    OCP\Util::addScript('files', 'jquery.iframe-transport');
    OCP\Util::addScript('files', 'jquery.fileupload');
    OCP\Util::addScript('files', 'jquery-visibility');
    OCP\Util::addScript('files', 'filesummary');
    OCP\Util::addScript('files', 'breadcrumb');
    OCP\Util::addScript('files', 'fileactions');
    OCP\Util::addScript('files', 'files');
    OCP\Util::addScript('files', 'keyboardshortcuts');
    OCP\Util::addScript('files', 'filelist');
    // now using handlebars for navigation
    \OC_Util::addVendorScript('core', 'handlebars/handlebars');
    // init of recover app 
    OCP\Util::addScript('recover', 'app');
    OCP\Util::addScript('recover', 'filelist');
    OCP\Util::addScript('recover', 'search');
    
    // files-app and therefore recover depends on it and my nav is using it too!
    // works without, but then even no history in main-nav
    OCP\Util::addScript('files', 'navigation');
    OCP\Util::addScript('recover', 'navigation');
    OCP\Util::addScript('files', 'fileactions');
    OCP\Util::addScript('files', 'files');
    OCP\Util::addScript('files', 'keyboardshortcuts');
    // search template stuff (angular)
    OCP\Util::addScript('recover', 'vendor/angular.min');
    OCP\Util::addScript('recover', 'config');
    OCP\Util::addScript('recover', 'mainctrl');
?>
<div id="app">
    <div id="app-navigation">
        <?php print_unescaped($this->inc('part.navigation')); ?>
        <?php print_unescaped($this->inc('part.settings')); ?>
    </div>
    <div id="app-content">
        <?php
                // initially load part.recent 
                print_unescaped($this->inc('part.recent')); 
        ?>
    </div>
</div>