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
    // not implemented yet, just showing title in navigation
    var translations = {
        recentlyBackedUp: $('#recently-backed-up-string').html()
    };
    /**
     * @class OCA.Recover.Navigation
     * @classdesc Navigation control for the recover app sidebar.
     *
     * @param $el container element
     * 
     */
    var Navigation = function($el) {
        this.initialize($el);
    };
    /**
     * @memberof OCA.Recover
     */
    Navigation.prototype = {
        /**
         * Currently selected item in the list
         * @type {Object} _activeLink active item of navigation
         * @type {string} _activeLink.id id of active item 
         * @type {string} _activeLink.title userfriendly title to be displayed
         * @type {boolean} _activeLink.active active is true or false
         */
        _activeLink: null,
        /**
         * this links object holds all our navigation items
         * an item is described above
         * @type {Object.<string, string, boolean>} active item of navigation
         */
        _items: [
            {id:"recently_backed_up", title:"Recently Backed Up", active:false},
            {id:"search", title:"Search", active:false},
            {id:"help", title:"Help", active:false}
        ],
        /*
         * Initialize the navigation
         * @param {type} $el el container element
         */
        initialize: function($el) {
            this.$el = $el;
            this._activeItem = null;
            this.$currentContent = null;
            // initially set recently_backed_up as active Link
            this._activeLink = this._items[0];
            this._activeLink.active = true; // still not grey 
            // push current link to browser history stack
            OC.Util.History.pushState(this._activeLink.id);
            //console.log("RECOVER nav init Active Link = " + this._activeLink.toSource());
        },
        /*
         * go through links, set matched link active
         * @param {string} id id of active link
         * @returns {undefined}
         */
        loadLink: function (id) {
            var self = this;
            this._items.forEach(function (link) {
                //console.log('in Links load loop: id = ' + id + ', link.id = ' + link.id);
                if (link.id === id) {
                    link.active = true;
                    self._activeLink = link;
                    
                    // without files nav
                    // setActiveItem in Files Navigation for using Browser History
                    // -> OCA.Files.App.navigation.setActiveItem(id, {silent: true});
                    // from files app _onNavigationChanged
                    // possible only using one parameter? originally item and dir
                    // in both cases OC.Util.History.pushState is called -> only using pushState
                    // OCA.Files.App._changeUrl(id);
                    OC.Util.History.pushState(id);
                } else {
                    link.active = false;
                }
            });
            //console.log('RECOVER load link, active link now = ' + this._activeLink.toSource());
        },
        getActiveLink: function () {
            //console.log('in Links getActiveLink this._activeLink = ' + this._activeLink.toSource());
            return this._activeLink;
        },
        getAll: function () {
            return this._items;
        },
        /*
         * check if item exists
         * @param {string} itemId id of link
         * @returns {navigation_L14.Navigation.$el.find.length} length of the found element
         */
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
     * @param {OCA.Recover.Navigation} navigation
     */ 
    var View = function (navigation) {
        this.nav = navigation;
    };
    /* TO DO:
     * is it possible not to have 3 times $.ajax despite having to change url and data?
     * why is OCA.Recover.App.fileList.getCurrentDirectory() not available?
     * how to get objects and functions available here?!?!
     * http://xhr.spec.whatwg.org/ - http://api.jquery.com/jQuery.ajax/
     */
    View.prototype = {
        /*
         * triggers rendering the content of the given navigation id
         * @param {string} id id of navigation item
         * @returns {undefined}
         */
        renderContent: function (id) {
            switch(id) {
                /* only used in filelist!!!
                 * JUST GETTING BLANK TEMPLATE HERE!:
                 */
                case "recently_backed_up":
                    $.ajax({
                        url: OC.generateUrl('/apps/recover/recently_backed_up')
                    })
                        .success(function( html ) {
                            $("#app-content").html( html ); 
                            /* has to work without init, further $el not defined!!
                             * delete the table completely, 
                             * then recreate a new FileList() and
                             * point it at the new table element
                             */
                            OCA.Recover.App.fileList = new OCA.Recover.FileList(
                                $('#app-content-recover'), {
                                    scrollContainer: $('#app-content'),
                                    fileActions: OCA.Recover.App._createFileActions()
                                }
                            );
                            OCA.Recover.App.fileList.reload();
                            OCA.Recover.App.fileList.$el.appendTo('#app-content');
                        });
                    break;
                case "search":
                    $.ajax({
                        url: OC.generateUrl('/apps/recover/search')
                    })
                        .success(function( html ) {
                            $( "#app-content" ).html( html );  
                        });
                    break;
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
                        url: OC.generateUrl('/apps/recover/recently_backed_up'),
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
                        });
            }   
        },
        /*
         * render navigation and content after link has been clicked
         */
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
        }
    };
    OCA.Recover.View = View;    
})(OC, window, jQuery);