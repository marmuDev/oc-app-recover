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
    	{id:1, title:"recently_deleted", content:"blub", active:true},
    	{id:2, title:"search", content:"blub", active:false},
    	{id:3, title:"help", content:"blub", active:false}
    ];
    
    this._activeLink = undefined;
    //this._activeLink = this._links[0];
    //console.log("in var Links _activeLink = " + this._activeLink.toSource())
};

Links.prototype = {
    
    load: function (id) {
        console.log('in Links load');
        var self = this;
        this._links.forEach(function (link) {
            if (link.id === id) {
                link.active = true;
                self._activeLink = link;
            } else {
                link.active = false;
            }
        });
    },
    
    getActive: function () {
    	console.log('in Links getActive');
        return this._activeLink;
    },
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
    getAll: function () {
    	/* returns the whole html code, isn't that a bit too much?
		 * seems like that's the way it should be...
    	 * console.log('this._links = ' + this._links.toSource());
    	 */
        return this._links;
    },
    loadAll: function () {
        var deferred = $.Deferred();
        var self = this;
        console.log('in Links loadAll');
        $.get(this._baseUrl).done(function (links) {
            self._activeLink = undefined;
            self._links = links;
            console.log('in links loadAll links = ' + links);
            deferred.resolve();
        }).fail(function () {
            deferred.reject();
        });
        return deferred.promise();
    },
    updateActive: function (title, content) {
    //updateActive: function (title) {
        var link = this.getActive();
        link.title = title;
        link.content = content;
        console.log('update active title = ' + title + ', content = ' + content);
        // wat wie wo warum?
        return $.ajax({
            url: this._baseUrl + '/' + link.id,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(link)
        });
    }
};

// this will be the view that is used to update the html
var View = function (links) {
    this._links = links;
};

View.prototype = {
    renderContent: function () {
        var self = this;
        /*
        * WARUM IS GETACTIVE UNDEFINED?!?!?!
        /*        
        var title = self._links.getActive().title;
        self._links.updateActive(title, content).done(function () {
            self.render();
        }).fail(function () {
            alert('Could not update link, not found');
        });
        */
        // source was already wrong, now part.content = part.recent
        	// how to use if or switch to render based on active navi link?
        var source = $('#content-tpl').html();
        //console.log('renderContent source = ' + source);
        var template = Handlebars.compile(source);
        //console.log('template in renderContent = ' + template);
        //console.log('getActive = ' + this._links.getActive());
        // -> result of getActive is undefined!!!
        var data = "init";
        //var html = template({link: this._links.getActive()});
        var html = template(data);
        //console.log('html in renderContent = ' + html);
        
        //$('#app-content').html(html);
        //$('#app-content').append(html);
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
        var html = template({links: this._links.getAll()});
        console.log('renderNav html = ' + html);
        $('#app-navigation ul').html(html);

        // create a new link
		// script crashes here
        //self.render();
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
            // id is NaN!!!
            //wenn data hinzu -> undefined
            var dataToParse = $(this).parent();
            console.log('dataToParse' + dataToParse.toSource());
            //var id = parseInt($(this).parent().data('id'), 10);
            var id = parseInt($(this).parent().data('id'), 10);
            console.log("load link self = " + self + ", id = " + id);
            self._links.load(id);
            
            //$('#editor textarea').focus();
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
links.loadAll().done(function () {
	//links.load(1);
    view.render();
}).fail(function () {
    alert('Could not load links');
});


});

})(OC, window, jQuery);