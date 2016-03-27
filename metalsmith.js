'use strict';

var handlebars = require('handlebars'),
    hbsLayouts = require('handlebars-layouts');

handlebars.registerHelper(hbsLayouts(handlebars));

var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var sass = require('metalsmith-sass');
var collections = require('metalsmith-collections');
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var excerpts = require('metalsmith-excerpts');
var ShortcodeParser = require('meta-shortcodes');
var logger = require('log4js').getLogger('metalsmith');



var parsers = {
    'alert-info': function (pages, metalsmith, currentPage) {
        return function (opts, content) {
            return '<div class="content-entry alert alert-info alert-block">' + content + '</div>';
        }
    },
    'previous-post': function (pages, metalsmith, currentPage) {
        return function (opts, content) {

            return '<a href="' + currentPage.previous.path + '" title="' + currentPage.previous.title + '">'  + content + '</a>';

        }
    }
};

handlebars.registerHelper('moment', function(context,format){
    return moment(context).format(format)
});
handlebars.registerHelper('json', function(context) {
    if ( !!context) {
        return Object.keys(context);
    }else{
        return 'null';
    }
});
handlebars.registerHelper('hbs', function(context){
    return handlebars.compile(context)({});
});

var app = new Metalsmith(__dirname)
        .use(function( pages, metalsmith){
            //console.log(metalsmith.collections);
            metalsmith._metadata = {};
            _.each(pages, function(p,filepath){

                p.filepath = filepath;
            });
            //metalsmith.collections.articles = null;
        })

        .use(collections({
            articles: {
                pattern: 'posts/**/*.md',
                sortBy: function(a,b){
                    return new Date(b.published) - new Date(a.published);
                },
                reverse:false
            },
            pages: {
                pattern: '**/*.md'

            }

        }))
        .use( function(pages, metalsmith){ // todo : manual sort as the collection sort is messed up..
            var pList = metalsmith._metadata.collections.articles;
            pList.sort(
                function(a,b){
                    return new Date(b.published) - new Date(a.published);
                }
            );
            pList.reverse(); // reverse only for sorting code readability.

            for ( var i = 0; i < pList.length; i++){
                //pList[i].next = null;
                //pList[i].previous = null;
                if ( i === 0 ){
                    pList[i].next = pList[i+1];
                    pList[i].previous = null;
                }else if ( i === pList.length -1  ){
                    pList[i].previous = pList[i-1];
                    pList[i].next = null;
                }else{
                    pList[i].next = pList[i+1];
                    pList[i].previous = pList[i-1];
                }
            }
            pList.reverse(); // reverse back for index page..
        })

        .use(function(pages){
            _.each(pages, function(p,path){
                p.path = '/' + path.replace(/\.md$/,'.html');

            });



        })
        .use(function(pages,metalsmith){ // fix for 'collection' uniqueness... happens when combined with 'watch'
            var p = _.find(metalsmith._metadata.collections.pages, function(page){
                return !!_.find(['title','keywords','description'], function(field){
                    if ( !_.has(page,field) ) {
                        logger.error('page ', page.filepath, 'is missing field', field);
                        return true;
                    }
                });
            });
            if ( p ) {
                throw new Error('page ' + p.filepath + ' is missing some details');
            }
        })
        .use(function(pages, metalsmith){
            _.each(pages, function(page){
                if ( page.shortcodes ) {
                    var parser = new ShortcodeParser({
                        openPattern: '\\[#',
                        closePattern: '\\]'
                    });
                    _.each(parsers, function(p, name){
                        parser.add(name, p(pages, metalsmith, page))
                    });
                    page.contents = new Buffer(parser.parse(page.contents.toString()));
                }
            })
        })
        .use(markdown())
        .use(excerpts())

        .use(layouts({engine:'handlebars', partials:'layouts'}))
        .use(sass())

        //.use(function(pages, metalsmith){
        //    var articles = _.filter(pages,{'collection' : ['articles']});
        //    console.log(articles);
        //    var str = _.map(articles, function(a){
        //        return '<a href="' + a.path + '">' + a.title + '</a>';
        //    }).join('<br/>');
        //
        //    pages['index.html'] = {
        //        contents : new Buffer(str)
        //    };
        //})

    ;

if (module.parent) {
    module.exports = app
} else {
    app.build(function (err) { if (err) throw err })
}
