/**
 * ownCloud - recover - navigation + view 
 * using handlebars and client-side templating for navigation bar
 * 
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

    // now constructing navigation in app.js
    //$(document).ready(function () {

    // not implemented yet, just showing title in navigation
    var translations = {
        recentlyDeleted: $('#recently-deleted-string').text()
    };

    /**
     * @class OCA.Recover.Navigation
     * @classdesc Navigation control for the recover app sidebar.
     *
     * @param baseUrl... I guess this is obsolete
     */
    var Navigation = function() {
        this.initialize();
    };

    

    Navigation.prototype = {
        /**
         * Currently selected item in the list
         */
        _activeLink: null,

        // this links object holds all our links
        _items: [
            //{id:"trashbin", title:"Recently Deleted", active:true},
            {id:"recently_deleted", title:"Recently Deleted", active:false},
            {id:"search", title:"Search", active:false},
            {id:"help", title:"Help", active:false}
        ],
        
        initialize: function() {
            // initially set recently_deleted as active Link
            // even without this line it is grey (active) for a moment when loading, 
            // but should stay grey until another link is clicked -> to solve
            this._activeLink = this._items[0];
            this._activeLink.active = true; // still not grey 
            OC.Util.History.pushState(this._activeLink.id);
            OCA.Files.App.navigation.setActiveItem(this._activeLink.id, {silent: true});
            console.log("RECOVER nav Links init Active Link = " + this._activeLink.toSource());
            //links.loadLink(0);
            //view.render();
        },

        /*
        var Links = function (baseUrl) {
            this._baseUrl = baseUrl;
            this._items = [
                //{id:"trashbin", title:"Recently Deleted", active:true},
                {id:"recently_deleted", title:"Recently Deleted", active:false},
                {id:"search", title:"Search", active:false},
                {id:"help", title:"Help", active:false}
            ];
            this._activeLink = 'undefined';
        };
*/
        // go through links, set matched link active
        loadLink: function (id) {
            var self = this;
            this._items.forEach(function (link) {
                //console.log('in Links load loop: id = ' + id + ', link.id = ' + link.id);
                if (link.id === id) {
                    link.active = true;
                    self._activeLink = link;
                    // setActiveItem in Files Navigation for using Browser History
                    // OCA.Files.App.navigation.setActiveItem(id, {silent: true});
                    // from files app _onNavigationChanged
                    // possible only using one parameter? originally item and dir
                    // in both cases OC.Util.History.pushState is called -> only using pushState
                    // OCA.Files.App._changeUrl(id);
                    OC.Util.History.pushState(id);
                    OCA.Files.App.navigation.setActiveItem(id, {silent: true});
                } else {
                    link.active = false;
                }
            });
            console.log('active link now = ' + this._activeLink.toSource());
        },
        /*
        setActiveLink: function (id) {
            //var self = this;
            //this._activeLink = this._items[id];
            //this._activeLink.active = 'true';
        },     
*/
        getActiveLink: function () {
        	//console.log('in Links getActiveLink this._activeLink = ' + this._activeLink.toSource());
            return this._activeLink;
        },
        
        getAll: function () {
            return this._items;
        }
    };
        
    OCA.Recover.Navigation = Navigation;    


    /**
     * @class OCA.Recover.View
     * @classdesc The view that is used to update the html
     *
     * @param navigation
     */
    // 
    var View = function (navigation) {
        this.nav = navigation;
    };

    View.prototype = {
        /** not using client-side templating for now
         *  now loading content into app-content via ajax?
         *  first check trashbin way again... too complicated, maybe later
         *  is it possible not to have 3 times $.ajax despite having to change url and data?
         why is OCA.Recover.App.fileList.getCurrentDirectory() not available?
         how to get objects and functions available here?!?!
          http://xhr.spec.whatwg.org/ - http://api.jquery.com/jQuery.ajax/
          -> statt .done .success
         */
        renderContent: function (id) {
            console.log('RECOVER nav render content');
            //var url = 'init';
            //var data = 'init';
            switch(id) {
                //case "0":
                case "recently_deleted":
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
                            // if you still want to delete the table completely, 
                            // then you need to recreate a new FileList() and point it at the new table element
                            OCA.Recover.App.fileList = new OCA.Recover.FileList(
                                $('#app-content-trashbin'), {
                                    scrollContainer: $('#app-content'),
                                    fileActions: OCA.Recover.App._createFileActions()
                                }
                            );
                            // initialized in constructor!
                            //OCA.Recover.App.fileList.initialize();
                            OCA.Recover.App.fileList.reload();
                            OCA.Recover.App.fileList.$el.appendTo('#app-content');
                            //console.log('html = ' + html);
                        });
                    break;
                //case "1":
                case "search":
                    $.ajax({
                        url: OC.generateUrl('/apps/recover/search')
                    })
                        .success(function( html ) {
                            $( "#app-content" ).html( html );
                            
                        });
                    break;
                //case "2":
                case "help":
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
            //var html = template({links: this.nav.getAll()});
            //var html = template({links: self.nav.getAll()});
            var html = template({links: OCA.Recover.App.navigation.getAll()});
            $('#app-navigation ul').html(html);
            // load a link on click event
            $('#app-navigation a').click(function () {
                // get id of clicked link
                var id = $( this ).parent().get( 0 ).id;
                OCA.Recover.App.navigation.loadLink(id);
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

    OCA.Recover.View = View;    
    
    /* moved to app.js
    var navigation = new Navigation(OC.generateUrl('/apps/recover/'));
    var view = new View(navigation);
    view.renderNavigation();
    */
// });
})(OC, window, jQuery);