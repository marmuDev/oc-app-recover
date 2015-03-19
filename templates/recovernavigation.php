<div id="app-navigation">
	<ul>
		<li data-id='recently_deleted' class="nav-recently">
            <a href='http://localhost/core/index.php/apps/recover/'>Zuletzt geändert</a>
        </li>
        <li data-id='search' class="nav-search">
            <a href=''>Suche</a>
        </li>
        <li data-id='help' class="nav-help">
        	<!-- only available with app framework and angular
        	<a href="{{ link|ocSanitizeURL }}">My link</a>
        	-->
            <a>Hilfe</a>
        </li>
	</ul>
	<?php print_unescaped($this->inc('part.settings')); ?>
</div>