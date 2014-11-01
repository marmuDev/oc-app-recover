<?php
//\OCP\Util::addScript('mynewapp', 'script');
//\OCP\Util::addScript('mynewapp', 'angular.min');
//\OCP\Util::addStyle('mynewapp', 'style');

script('mynewapp', array('angular.min', 'script'));
style('mynewapp', 'style');
?>

<div id="app">
    <div ng-app="mynewapp"> 
	<div id="app-navigation">
		<?php print_unescaped($this->inc('part.navigation')); ?>
		<?php print_unescaped($this->inc('part.settings')); ?>
	</div>

	<div id="app-content">
		<div id="app-content-wrapper">
			<?php print_unescaped($this->inc('part.content')); ?>
		</div>
	</div>
    </div>
</div>
