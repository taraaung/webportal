/*
 * Copyright (c) 2015 - 2026 - Tara Aung Co., Ltd - All Rights Reserved.
 * Tara Systems Project - Proprietary and confidential. www.taraaung.com
 */

/* global SUPABASE_CONFIG cloudDomainColumn clientFirstTimeColumn getResponseObject shopNameColumn hostNameColumn systemTypeColumn */

const TABLE_NAME = "web_portal";

// eslint-disable-next-line no-unused-vars
function getCloudDomainFromSupabase(shopName, hostName, systemType) {
    assertSupabaseConfigured();

    return getSupabaseShopRow({ selectColumn: `${cloudDomainColumn},${clientFirstTimeColumn}`, shopName, hostName, systemType })
        .then(function (response) {
            return getResponseObject(response);
        }).catch(function (error) {
            console.log("getCloudDomainFromSupabase error:", error);
            throw new Error(error.message);
        });
}

function getSupabaseShopRow({ selectColumn, shopName, hostName, systemType }) {
    const query = "?select=" + selectColumn + "&" + encodeURIComponent(shopNameColumn) +
        "=eq." + encodeURIComponent(shopName) +
        "&" + encodeURIComponent(hostNameColumn) + "=eq." + encodeURIComponent(hostName) +
        "&" + encodeURIComponent(systemTypeColumn) + "=eq." + encodeURIComponent(systemType) +
        "&limit=1";
    return supabaseGet(TABLE_NAME, query)
        .then(function (rows) {
            return rows;
        }).catch(function (error) {
            console.log("getSupabaseShopRow error:", error);
            throw new Error(error.message);
        });
}

function supabaseGet(tableName, query) {
    return httpGet(SUPABASE_CONFIG.url.replace(/\/$/, "") + "/rest/v1/" + encodeURIComponent(tableName) + query,
        {
            apikey: SUPABASE_CONFIG.anonKey,
            Authorization: "Bearer " + SUPABASE_CONFIG.anonKey
        });
}

function assertSupabaseConfigured() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || !TABLE_NAME) {
        throw new Error("Supabase is not configured properly.");
    }
}

function httpGet(theUrl, headers) {
    return fetch(theUrl, {
        headers: headers || {}
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
        }

        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text();
        }
    });
}
