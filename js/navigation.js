/**
 * ownCloud - recover - navigation with handlebars and client-side templating
 *  would be really nice to switch whole app to client-side tmplating...
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

    var translations = {
        recentlyDeleted: $('#recently-deleted-string').text()
    };

    // this links object holds all our links (meaning navigation links?)
    var Links = function (baseUrl) {
        this._baseUrl = baseUrl;
        this._links = [
        	{id:0, title:"recently_deleted", active:true},
        	{id:1, title:"search", active:false},
        	{id:2, title:"help", active:false}
        ];
        this._activeLink = this._links[0];
        //this._activeLink = undefined;
        //this._activeLink = this._links[0]; // -> getActive still returning undefined
        //console.log("in var Links init _activeLink = " + this._activeLink.toSource())
    };

    Links.prototype = {
        
        // go through links, set matched link active
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
        
        getAll: function () {
            return this._links;
        }
    };
        

    // this will be the view that is used to update the html
    var View = function (links) {
        this._links = links;
    };

    View.prototype = {
        /** not using client-side templateing for now
        renderContent: function () {
            var self = this;
            // how to use if or switch to render based on active navi link?
            
            var source = $('#content-tpl').html();
            console.log('renderContent source = ' + source);
            // problem?        
            var template = Handlebars.compile(source);
                    
            var html = template({content: this._links.getActive().content});
            console.log('html in renderContent = ' + html);
            
            $('#app-content').html(html);
            self.render();
            //$('#app-content').html(this._links.getActive().content);
            // inc part.recent steht nun da!
            //$('#app-content').append(html);
            
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
        },
        
         now loading content into app-content via ajax?
         first check trashbin way again... too complicated, maybe later
         is it possible not to have 3 times $.ajax despite havein to change url and data?
         why is OCA.Recover.App.fileList.getCurrentDirectory() not available?
         how to get objects and functions available here?!?!
          http://xhr.spec.whatwg.org/ - http://api.jquery.com/jQuery.ajax/
          -> statt .done .success
         */
        renderContent: function (id) {
            //var url = 'init';
            //var data = 'init';
            console.log('id = ' + id);
            switch(id) {
                case "0":
                    $.ajax({
                        url : OC.generateUrl('/apps/recover/recently_deleted'),
                        // -> empty content wrapper
                        //url : OC.generateUrl('/apps/recover/trashlist'),
                        // -> Object Object, since Trashbin returned as JSON data
                        //url : OC.generateUrl('/apps/recover/trashlist'),
                        data : {
                            dir: '/',
                            sort: 'mtime',
                            sortdirection: 'desc'
                        }
                        // how to use objects / methods from other files? 
                        /*
                        data : {
                            dir : OCA.Recover.App.fileList.getCurrentDirectory(),
                            sort: OCA.Recover.App.fileList._sort,
                            sortdirection: OCA.Recover.App.fileList._sortDirection
                        }
                        */
                    })
                        .success(function( html ) {
                            // simple hack replacing whole page instead of just "app-content"
                            $("#app-content").html( html ); 
                            //$("#app-content-trashbin").html( html );
                            console.log('html = ' + html);
                        });
                    console.log('case 0');
                    break;
                case "1":
                    $.ajax({
                        url : OC.generateUrl('/apps/recover/search')
                    })
                        .success(function( html ) {
                            $( "#app-content" ).html( html ); 
                        });
                    console.log('case 1');
                    break;
                case "2":
                    $.ajax({
                        url : OC.generateUrl('/apps/recover/help')
                    })
                        .success(function( html ) {
                            $( "#app-content" ).html( html ); 
                        });
                    console.log('case 2');
                    break;                    
                default:
                    //url='undefined';
                    $.ajax({
                        url : OC.generateUrl('/apps/recover/recently_deleted')
                        /*
                        data : {
                            dir : OCA.Recover.App.fileList.getCurrentDirectory(),
                            sort: OCA.Recover.App.fileList._sort,
                            sortdirection: OCA.Recover.App.fileList._sortDirection
                        }
                        */
                    })
                        .done(function( html ) {
                            $( "#app-content" ).html( html ); 
                        });
                    console.log('case default -> wie 0');
            }   
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
           
            // load a link
            $('#app-navigation a').click(function () {
                // get id of clicked link
                var id = $( this ).parent().get( 0 ).id;
                self._links.load(id);
                // without render, navi works, but navi and content not rerendered
                self.render(id);
            });
        },

        render: function (id) {
            this.renderNavigation();
            this.renderContent(id);
        }
    };

    //var links = new Links(OC.generateUrl('/apps/recover/index'));
    var links = new Links(OC.generateUrl('/apps/recover/'));
    var view = new View(links);
    //links.load(0);
    //view.render();
    view.renderNavigation();

    });

})(OC, window, jQuery);