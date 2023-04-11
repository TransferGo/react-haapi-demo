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

import {createHaapiFetch} from "@curity/identityserver-haapi-web-driver";
import config from "./config";
import {haapiConnectionIssue} from "./messages";

export default (() => {
    const haapiFetch = createHaapiFetch({
            clientId: config.clientId,
            tokenEndpoint: config.tokenEndpoint,
            timeout: 10
        })

    haapiFetch.init().catch(e => {
        console.error(haapiConnectionIssue)
    })

    return haapiFetch
})()
