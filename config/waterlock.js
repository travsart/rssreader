module.exports.waterlock = {
    baseUrl: 'http://localhost:8080',
    authMethod: [
        {
            name: 'waterlock-google-auth',
            clientId: '802351868445-3jtb4r8le9qjvl66ef96hl2ve1uroloj.apps.googleusercontent.com',
            clientSecret: 'L_E9_rMHgNj_Q8tYyYtPFuBY',
            allow: ['DOMAIN', 'USER@DOMAIN'],
            redirectUri: 'http://localhost:8080/login',
            fieldMap: {
                'firstName': 'given_name',
                'lastName': 'family_name',
                'gender': 'gender'
            }
        }
    ],

    jsonWebTokens: {

        secret: 'L_E999Ogj_Q8tYyYtPFuBY',
        expiry: {
            unit: 'days',
            length: '30'
        },
        audience: 'rssreader',
        subject: 'rssreader',
        trackUsage: true,
        stateless: false,
        tokenProperty: 'token',
        expiresProperty: 'expires',
        includeUserInJwtResponse: false
    },

    // Post Actions
    //
    // Lets waterlock know how to handle different login/logout
    // attempt outcomes.
    postActions: {

        // post login event
        login: {
            success: 'default',
            failure: 'default'
        },

        //post logout event
        logout: {
            success: 'default',
            failure: 'default'
        },
        // post register event
        register: {
            success: 'default',
            failure: 'default'
        }
    }
};
