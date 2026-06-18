/*
 * Copyright (c) 2015 - 2026 - Tara Aung Co., Ltd - All Rights Reserved.
 * Tara Systems Project - Proprietary and confidential. www.taraaung.com
 */

/* global getUrlParam:writable getCloudDomainFromSupabase getCloudDomainFromAppwrite */
let loadingImg, infoMessage;

// eslint-disable-next-line no-unused-vars
const shopNameColumn = "shop_name"
// eslint-disable-next-line no-unused-vars
const hostNameColumn = "host_name"
// eslint-disable-next-line no-unused-vars
const systemTypeColumn = "system_type"
const cloudDomainColumn = "cloud_domain"
const clientFirstTimeColumn = "is_client_first_time"
const ERROR_MESSAGE = {
    domain: "Sorry, server domain cannot be fetched!<br> VPN ဖွင့်ပြီး page ကို Reload လုပ်ပေးပါ။ <br>Please turn on VPN and Reload page.",
    cookie: "Sorry, client information cannot be fetched!"
};

// eslint-disable-next-line no-unused-vars
function init() {
    loadingImg = document.getElementById("loading_img");
    infoMessage = document.getElementById("message");
    const shopName = getUrlParam("shop_name");
    let systemType = getUrlParam("system_type");
    const hostName = getUrlParam("host_name");
    const resource = getUrlParam("resource_value");
    let resourceUrl = "";
    if (!shopName) {
        showErrorMessage(
            "\"ShopName\" cannnot be empty.</br>" +
            "\"ShopName\" ထည့်‌ပေးပါ။",
            shopName, hostName, systemType);
        return;
    } else if (!systemType) {
        showErrorMessage(
            "\"SystemType\" cannnot be empty.</br>" +
            "\"SystemType\" ထည့်‌ပေးပါ။",
            shopName, hostName, systemType);
        return;
    } else if (!hostName) {
        showErrorMessage(
            "\"HostName\" cannnot be empty.</br>" +
            "\"HostName\" ထည့်‌ပေးပါ။",
            shopName, hostName, systemType);
        return;
    }
    if (resource) {
        resourceUrl = "/resources/" + resource + "/index.html";
    }
    systemType = systemType.toUpperCase()
    getCloudDomain(shopName, hostName, systemType)
        .then(function (response) {
            const serverPublicUrl = response.domain + "/tarabar";
            let params = "?host_name=" + hostName + "&sn=" + shopName;
            params += "&icft=" + (response ? response.isClientFirstTime : "true");
            httpGetAsync(serverPublicUrl + "/client_info",
                function success(response) {
                    window.location.replace(serverPublicUrl + resourceUrl + params);
                }, function error(errorMsg) {
                    showErrorMessage("Sorry, server cannot be reached!", shopName, hostName, systemType);
                    window.location.replace(serverPublicUrl + resourceUrl + params);
                });
        }).catch(function (errorMsg) {
            showErrorMessage(errorMsg, shopName, hostName, systemType);
        });
}

function showErrorMessage(msg, shopName, hostName, systemType) {
    loadingImg.style.display = "none";
    const backBtn = document.getElementById("back_btn");
    if (backBtn) {
        backBtn.style.display = "block";
    }
    infoMessage.style.color = "red";
    infoMessage.style["font-size"] = "large";
    infoMessage.style["font-family"] = "cursive";
    infoMessage.style["line-height"] = "35px";
    infoMessage.innerHTML =
        (msg ? msg + "</br></br>" : "") +
        "ShopName = " + (shopName || "\" \"") + "</br>HostName = " + (hostName || "\" \"") + "</br>SystemType = " + (systemType || "\" \"") + "</br>" +
        "အပေါ်က အချက်အလက်များ မှန်ကန်ကြောင်း case sensitive ဖြစ်၍ case မှန်ကြောင်း စစ်ပေးပါ။<br>Please confirm above information is correct!</br></br>" +
        "1. Please check internet connection is ok at both Server and client machine.</br>" +
        "2. Check that Cloud Access status is online at Server Logs.</br>" +
        "3. At server machine, Click on \"Restart Cloud Access\" (Home Screen -> About -> Server Logs).</br>" +
        "4. Make sure Server and Client date and time are correct and the same.</br></br>" +
        "1. Cloud Services မရတော့တဲ့အခါ Server နဲ့ Client စက်တွေမှာ Internet ရှိမရှိစစ်ပေးပါ။</br>" +
        "2. Server စက်ရဲ့ Server Log မှာ online ဖြစ်ပီးစိမ်းနေလား စစ်ပေးပါ။</br>" +
        "3. Server စက်ရဲ့ about icon ထဲက server log တွင် \"Restart Cloud Access\" ကို နှိပ်၍ Cloud Service ကို restart ချပေးပါ။</br>" +
        "4. Server နှင့် Client စက်များ၏ အချိန် တူညီ‌ကြောင်း ကိုစစ်ပေးပါ။</br>";
}

// this fetch params in the url dynamically;
getUrlParam = function (name) {
    // eslint-disable-next-line no-useless-escape
    const results = new RegExp("[\?&]" + name + "=([^&#]*)").exec(window.location.href);
    if (results == null) {
        return null;
    } else {
        return results[1] || 0;
    }
};

// javascript native network fetcher
function httpGetAsync(theUrl, callback, errorCallback) {
    fetch(theUrl).then(function (response) {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text();
        }
    }).then(function (obj) {
        callback(obj);
    }).catch(function (msg) {
        errorCallback(msg);
    });
}

function getCloudDomain(shopName, hostName, systemType) {
    return Promise.resolve()
        .then(function () {
            return getCloudDomainFromSupabase(shopName, hostName, systemType);
        })
        .catch(function () {
            return getCloudDomainFromAppwrite(shopName, hostName, systemType);
        })
        .catch(function () {
            return getCloudDomainFromFirebase(shopName, hostName, systemType);
        });
}

function getCloudDomainFromFirebase(shopName, hostName, systemType) {
    return new Promise(function (resolve, reject) {
        httpGetAsync("https://tarabartest.firebaseio.com/Shops/" + shopName + "/cloud_domain.json",
            function (domainResponse) {
                if (!domainResponse[systemType]) {
                    reject(new Error(ERROR_MESSAGE.cookie));
                    return;
                }
                const serverPublicUrl = domainResponse[systemType];
                httpGetAsync("https://tarabartest.firebaseio.com/Shops/" + shopName + "/cookies/" + shopName + "-" + hostName + ".json",
                    function (cookieResponse) {
                        if (!cookieResponse) {
                            reject(new Error(ERROR_MESSAGE.cookie));
                            return;
                        }
                        cookieResponse.domain = serverPublicUrl;
                        resolve(cookieResponse);
                    }, function (msg) {
                        reject(new Error(ERROR_MESSAGE.cookie));
                    }
                );
            }, function (msg) {
                reject(new Error(ERROR_MESSAGE.domain));
            }
        );
    });
}

// eslint-disable-next-line no-unused-vars
function getResponseObject(response) {
    if (!response || !response.length) {
        throw new Error(ERROR_MESSAGE.cookie);
    }
    const row = response[0];
    const cloudDomain = row[cloudDomainColumn];
    const clientFirstTime = row[clientFirstTimeColumn];
    if (!cloudDomain || clientFirstTime === undefined) {
        throw new Error(ERROR_MESSAGE.cookie);
    }
    return {
        domain: cloudDomain,
        isClientFirstTime: clientFirstTime
    };
}
