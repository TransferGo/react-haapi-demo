/*
 *  Copyright 2022 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const url= new URLSearchParams(window.location.search);
let clientId = 'go_react_client_for_personal_user';
let environment = 'dev'
let authenticator = 'personal_user_phone.username';

if (url.has('client')) {
    clientId = url.get('client')
}

if (url.has('env')) {
    environment = url.get('env');
}
if (url.has('authenticator')) {
    authenticator = url.get('authenticator');
}

let config = {
    clientId: clientId,
    scope: 'openid',
    authenticator: authenticator,
};

if (environment === 'dev') {
    config.redirectUri = 'http://localhost:3000/';
    config.serverBaseUri = 'https://auth.transfergo.land/'
    config.authorizationEndpoint = 'https://auth.transfergo.land/oauth/v2/oauth-authorize'
    config.tokenEndpoint = 'https://auth.transfergo.land/oauth/v2/oauth-token'
}

if (environment === 'staging') {
    config.redirectUri = 'https://dcysov8zlfov7.cloudfront.net/';
    config.serverBaseUri = 'https://auth.tgalpha.com/'
    config.authorizationEndpoint = 'https://auth.tgalpha.com/oauth/v2/oauth-authorize'
    config.tokenEndpoint = 'https://auth.tgalpha.com/oauth/v2/oauth-token'
}

export default config
