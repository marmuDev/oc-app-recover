
<!--
If list entries should have 16x16 px icons,
the with-icon class can be added to the base ul
<ul class="with-icon">
-->
<ul>
    <div ng-controller="NaviController as naviCtrl">
        <li ng-class="{ active:naviCtrl.isSelected(1) }">
            <a href ng-click="naviCtrl.selectLink(1)">Zuletzt geändert</a></li>
        <li ng-class="{ active:naviCtrl.isSelected(2) }">
            <a href ng-click="naviCtrl.selectLink(2)">Suche</a></li>
        <li ng-class="{ active:naviCtrl.isSelected(3) }">
            <a href ng-click="naviCtrl.selectLink(3)">Anfrage</a></li>
        <li ng-class="{ active:naviCtrl.isSelected(4) }">
            <a href ng-click="naviCtrl.selectLink(4)">Einstellungen</a></li>
        

        <!-- trying to generate a link to the route -->
        <li><a href="
            <?php 
               p(\OCP\Util::linkToRoute('mynewapp.page.show_notify_settings')); 
            ?>
           "
           >gen link settings</a>
        </li>
        <!--<li><a href="./notifysettings">Edit Notify Settings</a></li> -->
    </div>
</ul>
