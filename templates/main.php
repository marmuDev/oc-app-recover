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
OCP\Util::addStyle('files', 'files');
OCP\Util::addStyle('files', 'upload');
OCP\Util::addStyle('files', 'mobile');
OCP\Util::addStyle('files_trashbin', 'trash');
// angular and app first, now more with OCP\UTIL to change orders more comfortable
//script('recover', array('vendor/angular.min', 'app/app', 'app/run', 'app/config', 'app/services/services'));

// scripts for files lists and trashbin stuff
// https://github.com/owncloud/core/blob/master/apps/files/index.php#L37
// added further scripts found while comparing trashbin DOM with recover DOM
OCP\Util::addScript('files', 'app');
//OCP\Util::addScript('files', 'file-upload');
OCP\Util::addScript('files', 'jquery.iframe-transport');
OCP\Util::addScript('files', 'jquery.fileupload');
OCP\Util::addScript('files', 'jquery-visibility');
OCP\Util::addScript('files', 'filesummary');
OCP\Util::addScript('files', 'breadcrumb');
OCP\Util::addScript('files', 'filelist');

//OCP\Util::addScript('files', 'search');
//OCP\Util::addScript('files', 'favoritesfilelist');
//OCP\Util::addScript('files', 'tagsplugin');
//OCP\Util::addScript('files', 'favoritesplugin');

//\OC_Util::addVendorScript('core', 'handlebars/handlebars');
OCP\Util::addScript('recover', 'app/app');
OCP\Util::addScript('recover', 'myfilelist');
// searchbox adapted from core search
// now adapted search.setFilter('', function (query) in recoversearch
//OCP\Util::addScript('recover', 'search');
// search adapted from core files search
OCP\Util::addScript('recover', 'recoversearch');
// among others actions will have to be adapted for the recovery of files from different sources
OCP\Util::addScript('files', 'fileactions');
OCP\Util::addScript('files', 'files');
OCP\Util::addScript('files', 'navigation');
OCP\Util::addScript('files', 'keyboardshortcuts');
// now trying with no angular at all!
//OCP\Util::addScript('recover', 'app/controllers/mainctrl');

//include appframework which helps to interact with the OC-server?
// OC.x scheint durch function (...,OC,..) in script.js bereits verfügbar
?>
<!-- seems like angular stuff messes with DOM
<div id="app">
             seems like angular menu stuff messes with DOM expected by trashbin
    <div ng-app="recover"> -->
<div id="app-navigation"> 
        <?php print_unescaped($this->inc('part.navigation')); ?>
        
        <!-- einfach rausnehmen, wenn settings unten stören, da ohne funktion -->
        <?php print_unescaped($this->inc('part.settings')); ?>
</div>

<div id="app-content">
		    <?php print_unescaped($this->inc('part.recent')); ?>
</div>
