<div ng-controller="SearchController as searchCtrl">
    <!--  searchCtrl.search als gesamtes Objekt an addSearch übergeben,
        will nicht... ist in news app aber ähnlich gelöst
    Navigation.createFolder(folder)
    
    "novalidate" turns off browser build in HTML validation!
    
    required macht keinen sinn, bzw es gibt keine direkten pflichtfelder,
    aber es sollte mindestens name oder zeit raum oder größe angegeben werden
    ->  searchForm.$valid && nur wenn valid, dann submitten... 
        noch weitere tests, prüfung auf "number" und "date" automatisch
    -->
    <form name="searchForm" 
          ng-submit="searchForm.$valid && 
                      searchCtrl.addSearch(searchCtrl.search.filename)"
          novalidate>
        <h1>Suche</h1><br>
        <!-- am besten suchfeld, dass direkt dynamisch Ergebnisse anzeigt -->
        <input type="text" 
               ng-model="searchCtrl.search.filename"
               placeholder="<?php p($l->t('File name')); ?>"
               title="<?php p($l->t('File name')); ?>"
               name="folderName">
        <br>
        <!--    ggf mit schiebereger -->
        <input type="number" 
               ng-model="searchCtrl.search.filesizemin"
               placeholder="<?php p($l->t('Min File Size in MB')); ?>"
               title="<?php p($l->t('Min File Size in MB')); ?>"
               name="Min File Size">
        <br>
        <input type="number" 
               ng-model="searchCtrl.search.filesizemax"
               ng-model="searchCtrl.search.filesizemin"
               placeholder="<?php p($l->t('Max File Size in MB')); ?>"
               title="<?php p($l->t('Max File Size in MB')); ?>"
               name="Max File Size">
        <br>
        <input type="date" 
               ng-model="searchCtrl.search.datestart"
               name="Start date"
               placeholder="yyyy-MM-dd">
    <!--       ISO-8601 date format (yyyy-MM-dd)
               minimal value perhaps 1 year or 6 months in past?  
                max value should be today 
                min, max only supported in angular > 1.3 
               min="2014-11-11"
               max="2014-23-11"
               -->
        <br>
        <input type="date" 
            ng-model="searchCtrl.search.dateend"
            name="End date"
            placeholder="yyyy-MM-dd">
    <!--        min must be greater than min in Start Date
                max value should be today 
               min="2014-11-11"
               max="2014-23-11"
               -->
        <br>
        <select ng-model="searchCtrl.search.filesources">
    <!--        Usern wird die Quelle egal, bzw nicht bekannt sein. 
            Somit wollen die einfach nur suchen können
    -->
            <option value="1">all</option>        
            <option value="2">trashbin</option>
            <option value="3">AFS</option>
            <option value="4">GPFS</option>
            <option value="5">TSM</option>
        </select>
        <br>
        <input type="submit"
            value="<?php p($l->t('Search')); ?>"
        >
        <br>
        test angular data binding<br>
        Filename: {{searchCtrl.search.filename}}<br>
            Source: {{searchCtrl.search.filesources}}
    </form>
</div>
