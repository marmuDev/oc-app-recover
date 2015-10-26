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
?>
<div id="app-content-trashbin">
    <div id="controls">
        <div id="file_action_panel"></div>
    </div>
    <div id='notification'></div>

    <div id="emptycontent" class="hidden">
        <div class="icon-delete"></div>
        <h2><?php p($l->t('No backed up files')); ?></h2>
        <p><?php p($l->t('You will be able to recover backed up files from here')); ?></p>
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
                </th>
            </tr>
        </thead>
        <tbody id="fileList">
        </tbody>
        <tfoot>
        </tfoot>
    </table>
</div> 