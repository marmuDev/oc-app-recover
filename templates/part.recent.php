<!--
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
//    To use routes in OC_Template, use:
//    print_unescaped(\OCP\Util::linkToRoute(
        //'recover.page.get_recently_deleted', array('key' => 1)
  //          'recover.page.get_recently_deleted'
    //));
//    p("user: ".$_['user']." - ");
//    Request could not be converted to string
//    p("request: ".$_['request']." - ");
//    p("appname: ".$_['appname']." - ");

// OC trashbin list.php (in template + ajax) 
//   gut für setzen eines templates und erzeugen von liste 
// fileList CSS-stuff eigentlich aus core, nur minimale anpassungen in trash.css
// filestable -> 

?>

<div ng-controller="RecentController as recentCtrl">    
Quick Filter: <input type="text" ng-model="search"> {{search}} <br>
</div>

-->
<!--    array of objects -> use ng-repeat twice 
    was ist data-ng-repeat

    <tr ng-repeat="item in recentCtrl.items | filter:search">
            <td>{{item.filename}}</td>
            <td>{{item.timestamp}}</td>
            <td>{{item.location}}</td>
    </tr>
-->
<!-- for now just to load recent Controller in script.js 
to get filelist data 
now without angular!
<div ng-controller="RecentController as recentCtrl">    
-->

<!-- /apps/files_trashbin/templates/index.php -->
<!-- hidden viewcontainer raus! nur bei files app notwendig,
    weil je nach navi-auswahl entsprechende inhalte gezeigt werden
    -> standard files, trashbin, sharing etc.
<div id="app-content-trashbin" class="hidden viewcontainer"> 

<?php 
    /** @var $l OC_L10N */ 
    /* is printed, but trashlist not loading
    p("in part.recent");
    request is empty
    p('request = '.$_['request']);
    */
?>
-->
<?php
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
    OCP\Util::addScript('recover', 'myfilelist');
    // searchbox adapted from core search
    // now fdf_add_doc_javascript(fdf_document, script_name, script_code)ed search.setFilter('', function (query) in recoversearch
    // search adapted from core files search
    OCP\Util::addScript('recover', 'recoversearch');
    // redundant but files/app depends on it
    OCP\Util::addScript('files', 'navigation');
    // among others actions will have to be adapted for the recovery of files from different sources
    OCP\Util::addScript('files', 'fileactions');
    OCP\Util::addScript('files', 'files');
    OCP\Util::addScript('files', 'keyboardshortcuts');
?>
<div id="app-content-trashbin">
    <div id="controls">
        <div id="file_action_panel"></div>
    </div>
    <div id='notification'></div>

    <div id="emptycontent" class="hidden">
        <div class="icon-delete"></div>
        <h2><?php p($l->t('No deleted files')); ?></h2>
        <p><?php p($l->t('You will be able to recover deleted files from here')); ?></p>
    </div>

    <input type="hidden" name="dir" value="" id="dir">

    <div class="nofilterresults hidden">
        <div class="icon-search"></div>
        <h2><?php p($l->t('No entries found in this folder')); ?></h2>
        <p></p>
    </div>

    <table id="filestable">
        <thead>
            <tr>
                <th id='headerName' class="hidden column-name">
                    <div id="headerName-container">
                        <input type="checkbox" id="select_all_trash" class="select-all"/>
                        <label for="select_all_trash">
                            <span class="hidden-visually"><?php p($l->t('Select all'))?></span>
                        </label>
                        <a class="name sort columntitle" data-sort="name"><span><?php p($l->t( 'Name' )); ?></span><span class="sort-indicator"></span></a>
                        <span id="selectedActionsList" class='selectedActions'>
                            <a href="" class="undelete">
                                <img class="svg" alt=""
                                     src="<?php print_unescaped(OCP\image_path("core", "actions/history.svg")); ?>" />
                                <?php 
                                    // original
                                    //p($l->t('Restore'))
                                    p($l->t('Recover'))
                                ?>
                            </a>
                        </span>
                    </div>
                </th>
                <th id="headerDate" class="hidden column-mtime">
                    <a id="modified" class="columntitle" data-sort="mtime"><span><?php p($l->t( 'Deleted' )); ?></span><span class="sort-indicator"></span></a>
                    <span class="selectedActions">
                        <a href="" class="delete-selected">
                            <?php p($l->t('Delete'))?>
                            <img class="svg" alt=""
                                src="<?php print_unescaped(OCP\image_path("core", "actions/delete.svg")); ?>" />
                        </a>
                    </span>
                </th>
            </tr>
        </thead>
        <tbody id="fileList">
        </tbody>
        <tfoot>
        </tfoot>
    </table>
</div> 