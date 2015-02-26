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
// this is for using ownCloud Templates
//\OCP\Util::addScript('recover', 'script');
//\OCP\Util::addStyle('recover', 'style');

// this is how to do it using Twig Templates
//{{ script('public/app', 'appframework') }}

// my scripts first, now more with OCP\UTIL to change orders more comfortable
script('recover', array('vendor/angular.min', 'app/app'));
// scripts for files lists and trashbin stuff
// https://github.com/owncloud/core/blob/master/apps/files/index.php#L37
/**
OCP\Util::addStyle('files', 'upload');
OCP\Util::addStyle('files', 'mobile');
*/
// gotta use own app.js!!!
//OCP\Util::addscript('files', 'app');
/**
OCP\Util::addscript('files', 'file-upload');
OCP\Util::addscript('files', 'jquery.iframe-transport');
OCP\Util::addscript('files', 'jquery.fileupload');
OCP\Util::addscript('files', 'jquery-visibility');

*/
OCP\Util::addscript('files', 'filesummary');
OCP\Util::addscript('files', 'breadcrumb');
// at least actions will have to be adapted for the recovery of files from different sources
OCP\Util::addscript('files', 'fileactions');
OCP\Util::addscript('files', 'filelist');
OCP\Util::addscript('files', 'navigation');
OCP\Util::addscript('recover', 'myfilelist');
OCP\Util::addscript('recover', 'script');

OCP\Util::addStyle('files', 'files');
OCP\Util::addStyle('files_trashbin', 'trash');
/**
OCP\Util::addscript('files', 'search');
\OCP\Util::addScript('files', 'favoritesfilelist');
\OCP\Util::addScript('files', 'tagsplugin');
\OCP\Util::addScript('files', 'favoritesplugin');
*/

//include appframework which helps to interact with the OC-server?
// OC.x scheint durch function (...,OC,..) in script.js bereits verfügbar
?>

<div id="app">
    <div ng-app="recover"> 
    	<div id="app-navigation">
                <?php print_unescaped($this->inc('part.navigation')); ?>
                
    <!--            einfach rausnehmen, wenn settings unten stören, da ohne funktion-->
                <?php print_unescaped($this->inc('part.settings')); ?>
    	</div>

    	<div id="app-content">
    		<div id="app-content-wrapper"
                        ng-controller="ContentController as contentCtrl"> 
    <!--                    ng-model="selectedLink">-->
                        <!-- when $rootScope.linkNum === 1 is truthy (element is visible) -->
                <div ng-show="linkNum === 1">
    <!--                    <div ng-show="{{selectedLink.number}} === 1">-->
    			    <?php print_unescaped($this->inc('part.recent')); ?>
                    <br>
                </div>
                <div ng-show="linkNum === 2">
                    <?php print_unescaped($this->inc('part.search')); ?>
                    <br>
                </div>
                <div ng-show="linkNum === 3">
                    <?php print_unescaped($this->inc('part.help')); ?>
                    <br>
                </div>
                <div ng-show="linkNum === 4">
                    <?php print_unescaped($this->inc('part.more.settings')); ?>
                    <br>
                </div>
    		</div>
    	</div>
    </div>
</div>
