<?php
/**
 * ownCloud - recover - main template
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 *
 * TO DO: split into several template files, 
 * only load CSS an JS needed for specific template
 * now loading most JS scripts in part.recent
 *
 */
// this is for using ownCloud Templates
//\OCP\Util::addScript('recover', 'script');
//\OCP\Util::addStyle('recover', 'style');

// this is how to do it using Twig Templates
//{{ script('public/app', 'appframework') }}

// now trying with no angular at all!
// back to angular for search stuff
//OCP\Util::addScript('recover', 'app/controllers/mainctrl');

// load angular only in search template!!
// angular is back for navigation...
// now navi the files app way (\OCA\Files\App::getNavigationManager()->add)
// and back to angular for search form... 
//	-> fucks up DOM, find other solution
//OCP\Util::addScript('recover', 'vendor/angular.min');
// var app as angular module and further angular stuff
//OCP\Util::addScript('recover', 'app/config');
//OCP\Util::addScript('recover', 'app/run');
//OCP\Util::addScript('recover', 'app/controllers/mainctrl');

//include appframework which helps to interact with the OC-server?
// OC.x scheint durch function (...,OC,..) in script.js bereits verfügbar
	// trashbin/recover and files stuff
	OCP\Util::addStyle('files', 'files');
    OCP\Util::addStyle('files', 'upload');
    OCP\Util::addStyle('files', 'mobile');
    OCP\Util::addStyle('files_trashbin', 'trash');
    // should I be able to load this, or obsolete_
    //OCP\Util::addScript('appframework', 'public/app');
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
    // among others actions will have to be adapted for the recovery of files from different sources
    OCP\Util::addScript('files', 'fileactions');
    OCP\Util::addScript('files', 'files');
    OCP\Util::addScript('files', 'keyboardshortcuts');
    /* out due to initializing Files filelist two times, when out TypeError!
     * --> 	TypeError: OCA.Files.FileList is undefined myfilelist.js:44:1
     *		TypeError: OCA.Files.FileList is not a constructor app.js:67:19
	 *		TypeError: OCA.Recover.FileList is not a constructor app.js:45:18
 	 */
    OCP\Util::addScript('files', 'filelist');

    //OCP\Util::addScript('files', 'search');
    //OCP\Util::addScript('files', 'favoritesfilelist');
    //OCP\Util::addScript('files', 'tagsplugin');
    //OCP\Util::addScript('files', 'favoritesplugin');

    // now trying handlebars for navigation
    \OC_Util::addVendorScript('core', 'handlebars/handlebars');
    // won't work here, now set in init in app.js 
    //OCP\App::setActiveNavigationEntry('recently_deleted');

    // init of recover app 
    OCP\Util::addScript('recover', 'app/app');
    OCP\Util::addScript('recover', 'filelist');
    // searchbox adapted from core search
    // now fdf_add_doc_javascript(fdf_document, script_name, script_code)ed search.setFilter('', function (query) in recoversearch
    // search adapted from core files search
    OCP\Util::addScript('recover', 'recoversearch');
    // redundant but files/app depends on it and my nav is using it too!
    OCP\Util::addScript('files', 'navigation');
    OCP\Util::addScript('recover', 'navigation');
    // among others actions will have to be adapted for the recovery of files from different sources
    OCP\Util::addScript('files', 'fileactions');
    OCP\Util::addScript('files', 'files');
    OCP\Util::addScript('files', 'keyboardshortcuts');
    
    // search template stuff
   	OCP\Util::addScript('recover', 'vendor/angular.min');
    OCP\Util::addScript('recover', 'app/config');
    //OCP\Util::addScript('recover', 'app/run');
    OCP\Util::addScript('recover', 'app/controllers/mainctrl');
    
?>
<!-- seems like angular stuff messes with DOM, but trying again to make navigation work again 
ng-app must be there, id="app" is redundant
ng-app only works when surrounding navigation not more!
<div id="app"> 
now trying to add navi the files app way:
\OCA\Files\App::getNavigationManager()->add

<div id="app-navigation"> 
	<div ng-app="recover"> 	
 -->       

<div id="app">
	<div id="app-navigation">
		<?php print_unescaped($this->inc('part.navigation')); ?>
		<?php print_unescaped($this->inc('part.settings')); ?>
	</div>

	<div id="app-content">
		<!-- <div id="app-content-wrapper"> -->
		<?php
			// initially load part.recent 
			print_unescaped($this->inc('part.recent')); 
		?>
		
	</div>
</div>

