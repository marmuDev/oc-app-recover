// nav with handlebars
(function (OC, window, $, undefined) {
'use strict';

$(document).ready(function () {

var translations = {
    recentlyDeleted: $('#recently-deleted-string').text()
};

// this links object holds all our links (meaning navigation links?)
var Links = function (baseUrl) {
    this._baseUrl = baseUrl;
    this._links = ["recently_deleted", "search", "help"];
    console.log("in var Links links[0] = " + this._links[0])
    //this._activeLink = undefined;
    this._activeLink = this._links[0];
};

Links.prototype = {
    load: function (id) {
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
        return this._links;
    },
    loadAll: function () {
        var deferred = $.Deferred();
        var self = this;
        $.get(this._baseUrl).done(function (links) {
            self._activeLink = undefined;
            self._links = links;
            deferred.resolve();
        }).fail(function () {
            deferred.reject();
        });
        return deferred.promise();
    },
    updateActive: function (title, content) {
        var link = this.getActive();
        link.title = title;
        link.content = content;

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
        var source = $('#content-tpl').html();
        var template = Handlebars.compile(source);
        var html = template({link: this._links.getActive()});
        var self = this;

        /*
        $('#editor').html(html);

        // handle saves
        var textarea = $('#app-content');
        var self = this;
        $('#app-content button').click(function () {
            var content = textarea.val();
            var title = content.split('\n')[0]; // first line is the title

            self._links.updateActive(title, content).done(function () {
                self.render();
            }).fail(function () {
                alert('Could not update link, not found');
            });
        });
		*/
    },
    renderNavigation: function () {
        var source = $('#navigation-tpl').html();
        console.log('renderNav source =' + source);
        var template = Handlebars.compile(source);
        var html = template({links: this._links.getAll()});

        $('#app-navigation ul').html(html);

        // create a new link
        
        var self = this;
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

       
        // load a link
        $('#app-navigation .link > a').click(function () {
            var id = parseInt($(this).parent().data('id'), 10);
            self._links.load(id);
            self.render();
            //$('#editor textarea').focus();
        });
    },
    render: function () {
        this.renderNavigation();
        this.renderContent();
    }
};

var links = new Links(OC.generateUrl('/apps/recover/'));
var view = new View(links);
links.loadAll().done(function () {
    view.render();
}).fail(function () {
    alert('Could not load links');
});


});

})(OC, window, jQuery);