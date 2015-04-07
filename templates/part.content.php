<script id="content-tpl" type="text/x-handlebars-template">
	{{#each links}}
    	{{#if active}}
      		{{content}}
    	{{/if}}
	{{/each}}
</script>

<?php 

	print_unescaped($this->inc('part.recent')); 
	//print_unescaped($this->inc('part.search')); 
	//print_unescaped($this->inc('part.help')); 
?>