<div id="app-navigation">
	<ul>
		<?php foreach ($_['navigationItems'] as $item) { ?>
		<li data-id="<?php p($item['id']) ?>" class="nav-<?php p($item['id']) ?>"><a href="<?php p(isset($item['href']) ? $item['href'] : '#') ?>"><?php p($item['name']);?></a></li>
		<?php } ?>
	</ul>
	<?php print_unescaped($this->inc('part.settings')); ?>
</div>