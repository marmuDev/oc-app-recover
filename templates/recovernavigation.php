
<div id="app-navigation">
		<!--
		<ul>
			<li data-id='recently_deleted' class="nav-recently">
	            <a>Zuletzt geändert</a>
	        </li>
	        <li data-id='search' class="nav-search">
	            <a>Suche</a>
	        </li>
	        <li data-id='help' class="nav-help">
	        	<!-- only available with app framework and angular
	        	<a href="{{ link|ocSanitizeURL }}">My link</a>
	        	-->
	        <!--
	            <a>Hilfe</a>
	        </li>
		</ul>
		-->

	<!-- now with handlebars 
		translation strings 

	<div style="display:none" id="recently-deleted-string"><?php p($l->t('Recently Deleted')); ?></div>
	-->
	<script id="navigation-tpl" type="text/x-handlebars-template">
	    {{#each links}}
	        <li class="nav-link {{#if active}}active{{/if}}"  data-id="{{ id }}">
	            <a href="#">{{ title }}</a>
	        </li>
	    {{/each}}
	</script>
	<ul></ul>
	<?php print_unescaped($this->inc('part.settings')); ?>
</div>