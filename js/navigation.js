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
    var Navigation = function($el) {
        this.initialize($el);
    };

    
    // now inhereting from files
    //Navigation.prototype = _.extend({}, OCA.Files.Navigation.prototype, {
    /**
     * @memberof OCA.Recover
     */
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
        
        initialize: function($el) {
            this.$el = $el;
            // AUCH SETZEN??? auf recently_deleted?
            this._activeItem = null;
            this.$currentContent = null;
            // wie _setupEvents umgehen? siehe init von filelist, gleiches gilt dann für app?

            // initially set recently_deleted as active Link
            // even without this line it is grey (active) for a moment when loading, 
            // but should stay grey until another link is clicked -> to solve
            this._activeLink = this._items[0];
            this._activeLink.active = true; // still not grey 
            OC.Util.History.pushState(this._activeLink.id);
            
            // now again without files nav and its methods
            //OCA.Files.App.navigation.setActiveItem(this._activeLink.id, {silent: true});
            // does setActiveView help? this only calls setActiveItem from navigation class
            //OCA.Files.App.setActiveView(this._activeLink.id, {silent: true});
            //this.setActiveItem(this._activeLink.id, '{silent: true}');
            //this.setActiveItem(this._activeLink.id, {silent: true});
            //console.log("RECOVER nav init Active Link = " + this._activeLink.toSource());
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
                    
                    // now again without files nav!!!
                    // setActiveItem in Files Navigation for using Browser History
                    // OCA.Files.App.navigation.setActiveItem(id, {silent: true});
                    // from files app _onNavigationChanged
                    // possible only using one parameter? originally item and dir
                    // in both cases OC.Util.History.pushState is called -> only using pushState
                    // OCA.Files.App._changeUrl(id);
                    
                    OC.Util.History.pushState(id);
                    
                    //OCA.Files.App.navigation.setActiveItem(id, '{silent: true}');
                    // this is undefined!?!?
                    //self.setActiveItem(id, '{silent: true}');
                    // options again undefined
                    //self.setActiveItem(id, {silent: true});
                } else {
                    link.active = false;
                }
            });
            console.log('active link now = ' + this._activeLink.toSource());
        },
        /** FIRST CHECK IF getActiveContainer is responsible for wrong lastItemId
         * Switch the currently selected item, mark it as selected and
         * make the content container visible, if any.
         *
         * Adapted from files app navigation, for compatibility with files nav
         *  keeping it always silent? 
         *
         * back to setActiveItem here, since inheriting _onPopState from Files app
         *
         * @param string itemId id of the navigation item to select
         * @param array options "silent" to not trigger event
         */
        setActiveItem: function(itemId, options) {
            //console.log('FILES nav setActiveItem');
            this.setActiveCounter++;
            console.log('RECOVER nav setActiveItem counter = ' + this.setActiveCounter);
            console.log('RECOVER nav setActiveItem, itemId = ' + itemId + ', oldItemId = ' + oldItemId + ', options.silent = ' + options.silent);
            // to avoid options undefined error
            // console.log('RECOVER nav setActiveItem, itemId = ' + itemId + ', oldItemId = ' + oldItemId);  
            var oldItemId = this._activeItem;
            if (itemId === this._activeItem) {
                console.log('RECOVER nav setActiveItem, itemId === this._activeItem');
                if (!options || !options.silent) {
                    console.log('RECOVER nav setActiveItem: !options or !options.silent');
                    this.$el.trigger(
                        new $.Event('itemChanged', {itemId: itemId, previousItemId: oldItemId})
                    );
                }
                return;
            }
            this.$el.find('li').removeClass('active');
            if (this.$currentContent) {
                this.$currentContent.addClass('hidden');
                this.$currentContent.trigger(jQuery.Event('hide'));
            }
            this._activeItem = itemId;
            this.$el.find('li[data-id=' + itemId + ']').addClass('active');
            this.$currentContent = $('#app-content-' + itemId);
            console.log('RECOVER nav setActiveItem, currentContent = ' + this.$currentContent);
            this.$currentContent.removeClass('hidden');
            // check if forcing options silent helps, before getting options.silent working
            // trigger show is not needing in my case. perhaps itemChange is needed...
            if (!options || !options.silent) {
                console.log('RECOVER nav setActiveItem: !options or !options.silent - TRIGGERS DISABLED');
                /*
                this.$currentContent.trigger(jQuery.Event('show'));
                this.$el.trigger(
                    new $.Event('itemChanged', {itemId: itemId, previousItemId: oldItemId})
                );
                */
            }
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

        /**
         * Returns the container of the currently active app.
         *
         * @return app container
         */
        getActiveContainer: function() {
            console.log('RECOVER nav getActiveContainer, currentContent = ' + this.$currentContent);
            return this.$currentContent;
        },

        /**
         * Returns the currently active item
         * Like the above, but for compatibility with Files App and Nav 
         *
         * @return item ID
         */
        getActiveItem: function() {
            return this._activeLink.id;
        },
        
        getAll: function () {
            return this._items;
        },
        itemExists: function(itemId) {
            console.log('RECOVER nav itemExists, $el.find... length = ' + this.$el.find('li[id=' + itemId + ']').length)
            return this.$el.find('li[id=' + itemId + ']').length;
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
                    console.log('case default -> like case 0');
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