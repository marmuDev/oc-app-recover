/**
 * ownCloud - recover - navigation with handlebars and client-side templating
 * would be really nice to switch whole app to client-side tmplating...
 * Further rerendering view onClick via jQuery 
 * 
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Marcus Mundt <marmu@mailbox.tu-berlin.de>
 * @copyright Marcus Mundt 2015
 */
(function (OC, window, $, undefined) {
    'use strict';

    $(document).ready(function () {

        // not implemented yet, just showing title in navigation
        var translations = {
            recentlyDeleted: $('#recently-deleted-string').text()
        };

        // this links object holds all our links
        var Links = function (baseUrl) {
            this._baseUrl = baseUrl;
            this._links = [
            	{id:0, title:"recently_deleted", active:true},
            	{id:1, title:"search", active:false},
            	{id:2, title:"help", active:false}
            ];
            // even without this line it is grey (active) for a moment when loading, 
            // but should stay grey until another link is clicked -> to solve
            //this._activeLink = this._links[0];
            //this._activeLink = undefined;
            //this._activeLink = this._links[0]; // -> getActive still returning undefined
            //console.log("in var Links init _activeLink = " + this._activeLink.toSource())
            //this.load('0');
        };

        Links.prototype = {
            
            // go through links, set matched link active
            load: function (id) {
                var self = this;
                this._links.forEach(function (link) {
                    //console.log('in Links load loop: id = ' + id + ', link.id = ' + link.id);
                    if (link.id == id) {
                        link.active = true;
                        self._activeLink = link;
                    } else {
                        link.active = false;
                    }
                });
                //console.log('active link now = ' + this._activeLink.toSource());
            },
            
            getActive: function () {
            	//console.log('in Links getActive this._activeLink = ' + this._activeLink.toSource());
                return this._activeLink;
            },
            
            getAll: function () {
                return this._links;
            }
        };
            

        // this will be the view that is used to update the html
        var View = function (links) {
            this._links = links;
        };

        View.prototype = {
            /** not using client-side templating for now
             *  now loading content into app-content via ajax?
             *  first check trashbin way again... too complicated, maybe later
             *  is it possible not to have 3 times $.ajax despite havein to change url and data?
             why is OCA.Recover.App.fileList.getCurrentDirectory() not available?
             how to get objects and functions available here?!?!
              http://xhr.spec.whatwg.org/ - http://api.jquery.com/jQuery.ajax/
              -> statt .done .success
             */
            renderContent: function (id) {
                //var url = 'init';
                //var data = 'init';
                switch(id) {
                    case "0":
                        $.ajax({
                            url: OC.generateUrl('/apps/recover/recently_deleted')
                            /* only used in myfilelist!!!
                                JUST GETTING BLANK TEMPLATE HERE!
                            data : {
                                // when click on nav load root dir not current/last dir!!!
                                // dir : OCA.Recover.App.fileList.getCurrentDirectory(),

                                dir: '/',
                                sort: OCA.Recover.App.fileList._sort,
                                sortdirection: OCA.Recover.App.fileList._sortDirection
                            }
                            */
                            
                        })
                            .success(function( html ) {
                                $("#app-content").html( html ); 
                                // has to work without init, further $el not defined!!
                                //OCA.Recover.App.fileList.initialize();
                                OCA.Recover.App.fileList.reload();
                                OCA.Recover.App.fileList.$el.appendTo('#app-content');
                                //console.log('html = ' + html);
                            });
                        break;
                    case "1":
                        $.ajax({
                            url: OC.generateUrl('/apps/recover/search')
                        })
                            .success(function( html ) {
                                $( "#app-content" ).html( html );
                                
                            });
                        break;
                    case "2":
                        $.ajax({
                            url: OC.generateUrl('/apps/recover/help')
                        })
                            .success(function( html ) {
                                $( "#app-content" ).html( html ); 
                            });
                        break;                    
                    default:
                        $.ajax({
                            url: OC.generateUrl('/apps/recover/recently_deleted'),
                            data : {
                                dir : OCA.Recover.App.fileList.getCurrentDirectory(),
                                sort: OCA.Recover.App.fileList._sort,
                                sortdirection: OCA.Recover.App.fileList._sortDirection
                            }
                            
                        })
                            .success(function( html ) {
                                $("#app-content").html( html ); 
                                OCA.Recover.App.fileList.reload();
                                OCA.Recover.App.fileList.$el.appendTo('#app-content');
                                //console.log('html = ' + html);
                            });
                        console.log('case default -> wie 0');
                }   
            },

            renderNavigation: function () {
                var self = this;
                var source = $('#navigation-tpl').html();
                var template = Handlebars.compile(source);
                var html = template({links: this._links.getAll()});
                $('#app-navigation ul').html(html);
                // load a link on click event
                $('#app-navigation a').click(function () {
                    // get id of clicked link
                    var id = $( this ).parent().get( 0 ).id;
                    self._links.load(id);
                    // render content of clicked link
                    self.renderContent(id);
                });
            },
            /*
            render: function (id) {
                this.renderNavigation();
                this.renderContent(id);
            }
            */
        };
        //var links = new Links(OC.generateUrl('/apps/recover/index'));
        var links = new Links(OC.generateUrl('/apps/recover/'));
        var view = new View(links);
        //links.load(0);
        //view.render();
        view.renderNavigation();

    });

})(OC, window, jQuery);