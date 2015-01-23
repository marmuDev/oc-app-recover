<?php
// this is for using ownCloud Templates
//\OCP\Util::addScript('mynewapp', 'script');
//\OCP\Util::addScript('mynewapp', 'angular.min');
//\OCP\Util::addStyle('mynewapp', 'style');

// this is how to do it using Twig Templates
//{{ script('public/app', 'appframework') }}

script('mynewapp', array('vendor/angular.min', 'script'));
//include appframework which helps to interact with the OC-server?
// OC.x scheint durch function (...,OC,..) in script.js bereits verfügbar

style('mynewapp', array('style', 'trash'));
?>

<div id="app">
    <div ng-app="mynewapp"> 
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
