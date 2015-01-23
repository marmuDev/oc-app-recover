<div ng-controller="RecentController as recentCtrl">
<!--    <h1>User: {{recentCtrl.user.name}}</h1><br>

    fester Zeitraum von einem Monat, Quellen wählbar
    - Dateien aus trashbin anhand user name
    - ng.repeat hilft
-->

<!-- OC trashbin list.php gut für setzen eines templates 
und erzeugen von liste -->


<!-- OC trashbin templates/index.php -->
    
<?php 
    p("user: ".$_['user']." - ");
//    Request could not be converted to string
//    p("request: ".$_['request']." - ");
    p("appname: ".$_['appname']." - ");

    // wie gefundene ausgeben?
    // mit JS var problem, da script schon lief, bevor Var bereitsteht
    // -> route + ajax
    //p("recDel: ".$_['recentlyDeleted']);

//    To use routes in OC_Template, use:
//    print_unescaped(\OCP\Util::linkToRoute(
        //'mynewapp.page.get_recently_deleted', array('key' => 1)
  //          'mynewapp.page.get_recently_deleted'
    //));

?>
<br>
<input type="text" ng-model="search"> {{search}} <br>
<input type="text" ng-model="recentCtrl.text"> {{recentCtrl.text}}<br>

<table>
<!--    array of objects -> use ng-repeat twice 
    was ist data-ng-repeat
-->
<!--    <tr ng-repeat="item in recentCtrl.items | filter:search">-->
    <tr ng-repeat="item in recentCtrl.items">
        <td>{{item.filename}}</td>
<!--        <td>{{recentCtrl.item.timestamp}}</td>
        <td>{{recentCtrl.item.location}}</td>-->
    </tr>
</table>

<br>
<!--
    Dateiname: {{recentCtrl.item.filename}}<br>
    Datum: {{recentCtrl.item.timestamp}}<br>
    Quelle: {{recentCtrl.item.location}}<br> 
-->
</div>



            
