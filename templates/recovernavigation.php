	<!--
	<ul>
		<li data-id='recently_deleted' class="nav-recently">
            <a>Zuletzt geändert</a>
        </li>
        <li data-id='search' class="nav-search">
            <a>Suche</a>
        </li>
        <li data-id='help' class="nav-help">
        	 only available with app framework and angular
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

<li id="1" class="{{#if active}}active{{/if}}"><a href="#"><?php p($l->t('Search')); ?></a></li>
<li id="2" class="{{#if active}}active{{/if}}"><a href="#"><?php p($l->t('Help')); ?></a></li>

statt <li id="recently_deleted">  <li id="1"> !!!!
-->

<script id="navigation-tpl" type="text/x-handlebars-template">
	{{#each links}}
		<li id="{{id}}" class="nav-recover {{#if active}}active{{/if}}">
			<a href="#">{{title}}</a>
		</li>
	{{/each}}
</script>
<ul></ul>
