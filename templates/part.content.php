<div ng-controller="RecentController as recentCtrl"
     ng-model="selectedLink.number">
<!--    <div ng-show="naviCtrl.isSelected(1)" >-->
    <div ng-show="selectedLink.number === 1">
        <h1>{{recentCtrl.user.name}}</h1>
        <h1>Recently Deleted</h1>
            <!--     tabelle!-->
            Dateiname: {{recentCtrl.recdel.name}}<br>
            Datum: {{recentCtrl.recdel.date}}<br>
            Quelle: {{recentCtrl.recdel.source}}<br>
    </div>
</div>
<div ng-controller="SearchController as searchCtrl"
     ng-model="selectedLink.number">
<!--    <div ng-show="naviCtrl.isSelected(2)">-->
    <div ng-show="selectedLink.number === 2">
        <h1>Suche</h1>
    </div>
</div>

<br>
<p>
        Hello World <?php p($_['user'] ) ?> from <?php p($_['appname']) ?> <br>
           request was "<?php p($_['request']) ?>"
    </p>

    <p><button id="hello">click me</button></p>

    <p><textarea id="echo-content">Send this as ajax</textarea></p>
    <p><button id="echo">Send ajax request</button></p>

    Ajax response: <div id="echo-result"></div>
<!--<p><button id="notifysettings">NotifySettings via genUrlJS</button></p>-->
        

