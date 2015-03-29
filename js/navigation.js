/** nav with handlebars
 *  "this._notes = [{id:5, title:"blub", content:"blub"}]"
 *	"this._notes = [{id:5, title:"blub", content:"blub", active:true}]"
 *	
 */
(function (OC, window, $, undefined) {
'use strict';

$(document).ready(function () {

var translations = {
    recentlyDeleted: $('#recently-deleted-string').text()
};

// this links object holds all our links (meaning navigation links?)
var Links = function (baseUrl) {
    this._baseUrl = baseUrl;
    this._links = [
    	//{id:1, title:"recently_deleted", content:"index"},
    	{id:0, title:"recently_deleted", content:"<?php print_unescaped($this->inc('part.recent')); ?>", active:true},
    	{id:1, title:"search", content:"<?php print_unescaped($this->inc('part.search')); ?>", active:false},
    	{id:2, title:"help", content:"<?php print_unescaped($this->inc('part.help')); ?>", active:false}
    ];
    
    this._activeLink = undefined;
    //this._activeLink = this._links[0]; // -> getActive still returning undefined
    //console.log("in var Links init _activeLink = " + this._activeLink.toSource())
};

Links.prototype = {
    
    load: function (id) {
        var self = this;
        this._links.forEach(function (link) {
            //console.log('in Links load loop: id = ' + id + ', link.id = ' + link.id);
            if (link.id == id) {
                console.log("id == id");
                link.active = true;
                self._activeLink = link;
            } else {
                link.active = false;
            }
        });
        console.log('active link now = ' + this._activeLink.toSource());
    },
    
    getActive: function () {
    	console.log('in Links getActive this._activeLink = ' + this._activeLink.toSource());
        return this._activeLink;
    },
    /*
    removeActive: function () {
        var index;
        var deferred = $.Deferred();
        var id = this._activeLink.id;
        this._links.forEach(function (link, counter) {
            if (link.id === id) {
                index = counter;
            }
        });

        if (index !== undefined) {
            // delete cached active link if necessary
            if (this._activeLink === this._links[index]) {
                delete this._activeLink;
            }

            this._links.splice(index, 1);

            $.ajax({
                url: this._baseUrl + '/' + id,
                method: 'DELETE'
            }).done(function () {
                deferred.resolve();
            }).fail(function () {
                deferred.reject();
            });
        } else {
            deferred.reject();
        }
        return deferred.promise();
    },
    
    create: function (link) {
        var deferred = $.Deferred();
        var self = this;
        $.ajax({
            url: this._baseUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(link)
        }).done(function (link) {
            self._links.push(link);
            self._activeLink = link;
            self.load(link.id);
            deferred.resolve();
        }).fail(function () {
            deferred.reject();
        });
        return deferred.promise();
    },
    */
    getAll: function () {
    	/* returns the whole html code, isn't that a bit too much?
		 * seems like that's the way it should be...
    	 * console.log('this._links = ' + this._links.toSource());
    	 */
        return this._links;
    }
};
    //},
    /* gets notes via BASE_URL and route from service "NoteService" 
    loadAll: function () {
        var deferred = $.Deferred();
        var self = this;
        //console.log('in Links loadAll');
        $.get(this._baseUrl).done(function (links) {
            self._activeLink = undefined;
            self._links = links;
            /* so sollte das aussehen
             * "in links loadAll notes = [object Object],[object Object]" script.js:91
             * "this._notes = [{id:5, title:"blub", content:"blub"}, {id:6, title:"test", content:"test"}]"
             */
            // komplette HTML source!
            /*
            console.log('in links loadAll links = ' + links);
            deferred.resolve();
        }).fail(function () {
            deferred.reject();
        });
        return deferred.promise();
    },
        // not needed! 
    updateActive: function (title, content) {
    //updateActive: function (title) {
        console.log('in updateActive at beginning');
        var link = this.getActive();
        link.title = title;
        link.content = content;
        console.log('update active title = ' + title + ', content = ' + content);
        // writes new notes, see /controller/noteapicontroller
        return $.ajax({
            url: this._baseUrl + '/' + link.id,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(link)
        });
    }
};  */

// this will be the view that is used to update the html
var View = function (links) {
    this._links = links;
};

View.prototype = {
    renderContent: function () {
        var self = this;
        // how to use if or switch to render based on active navi link?
        var source = $('#content-tpl').html();
        console.log('renderContent source = ' + source);
        // problem?        
        var template = Handlebars.compile(source);
        console.log('template in renderContent = ' + template);
        //console.log('in render Content getActive = ' + this._links.getActive().content);
        // -> result of getActive is undefined!!!
        //var data = "init";
        
        var html = template({content: this._links.getActive().content});
        //var html = template(data);
        //console.log('html in renderContent = ' + html);
        
        $('#app-content').html(html);
        //$('#app-content').html(this._links.getActive().content);
        // inc part.recent steht nun da!
        //$('#app-content').append(html);
        
        // crashes script !!!
        //self.render();
        
        // also undefined
        //$('#app-content').append(template(this._links[0].content));
        //self.render();

        /*
        var html = template({link: this._links.getActive()});
        var content = $('#app-content');
        console.log('content = ' + content);
        var self = this;
        
        //var title = this._links.getActive().title;
        //console.log('title = ' +title);
		//self.render();
		/**
		
        */ 
    },
    renderNavigation: function () {
        var self = this;
        var source = $('#navigation-tpl').html();
        //console.log('renderNav source = ' + source);
        var template = Handlebars.compile(source);
        //console.log('renderNav template = ' + template);
        console.log('this links get all = ' + this._links.getAll());
        var html = template({links: this._links.getAll()});
        console.log('renderNav html = ' + html);
        //$('#app-navigation ul').html(html);
        $('#app-navigation ul').html(html);
        // script crashes here, seems like endless loop, 
        // render calls render again and again
        //self.render();

        // create a new link
        /*
        $('#new-link').click(function () {
            var link = {
                title: translations.newNote,
                content: ''
            };

            self._links.create(link).done(function() {
                self.render();
                //$('#editor textarea').focus();
            }).fail(function () {
                alert('Could not create link');
            });
        });
		*/
       
        // load a link
        $('#app-navigation a').click(function () {
            /* wenn data hinzu -> undefined, 
                data muss irgendwo gesetzt werden, bevor man es lesen kann
            // parent -> komplette HTML Source
            // nur this -> komplette HTML Source
            // immer komplette source!
            */
            //var dataToParse = $( this ).parent().get( 0 ).id;
            //console.log('dataToParse = ' + dataToParse);
            var id = $( this ).parent().get( 0 ).id;
            self._links.load(id);
            /*
            no need to load, set active and change content!
            load does part of it
            load does this already
            self._links._links.forEach(function(link) {
                if (link.id === id) {
                    link.active = true;
                } else { 
                    link.active = false ;
                }
            });
            self._links.getActive();
            */
            //$('#editor textarea').focus();
            // render needed? -> update of CSS class to "active"?
            self.render();
        });
    },
    render: function () {
    	this.renderNavigation();
        this.renderContent();
    }
};

//var links = new Links(OC.generateUrl('/apps/recover/index'));
var links = new Links(OC.generateUrl('/apps/recover/'));
var view = new View(links);
//links.loadAll().done(function () {
	links.load(0);
    view.render();
//}).fail(function () {
 //   alert('Could not load links');
//});


});

})(OC, window, jQuery);