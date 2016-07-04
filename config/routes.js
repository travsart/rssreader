/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/home.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': 'AuthController.home',
    '/runcheck': 'RssController.runCheck',
    '/rss/seed': 'RssController.seed',
    '/rss/updateall': 'RssController.updateAllRss',
    '/checkip': 'RssController.checkip',
    '/genre/generate': 'GenreController.generate',
    '/genre/del': 'GenreController.del',
    '/genre/compare': 'GenreController.generateSeedList',
    '/genre/seed': 'GenreController.seedGenre',
    '/genre/buildurls': 'GenreController.buildUrls',
    '/genre/buildmanga': 'GenreController.buildManga',
    '/genre/generaterss': 'GenreController.generateRss',
    '/genre/test': 'GenreController.test',
    'GET /login' : {view: 'login'},
    'POST /login' : 'AuthController.login',
    'POST /logout' : 'AuthController.logout'
};
