/*
 * Copyright (c) 2015 - 2026 - Tara Aung Co., Ltd - All Rights Reserved.
 * Tara Systems Project - Proprietary and confidential. www.taraaung.com
 */

/* global Appwrite APPWRITE_CONFIG getResponseObject shopNameColumn hostNameColumn systemTypeColumn ERROR_MESSAGE */

const SHOP_COLLECTION_ID = "web_portal";

const client = new Appwrite.Client()
    .setEndpoint(APPWRITE_CONFIG.url)
    .setProject(APPWRITE_CONFIG.projectId);
if (APPWRITE_CONFIG.apiKey) {
    client.headers["X-Appwrite-Key"] = APPWRITE_CONFIG.apiKey;
}
const tablesDB = new Appwrite.TablesDB(client);

// eslint-disable-next-line no-unused-vars
function getCloudDomainFromAppwrite(shopName, hostName, systemType) {
    assertAppwriteConfigured();
    return getAppwriteShopDocument(shopName, hostName, systemType)
        .then(function (response) {
            return getResponseObject(response);
        }).catch(function (error) {
            console.log("getCloudDomainFromAppwrite error:", error);
            throw new Error(error.message);
        });
}

function getAppwriteShopDocument(shopName, hostName, systemType) {
    const query = [
        Appwrite.Query.equal(
            shopNameColumn,
            [shopName]
        ),
        Appwrite.Query.equal(
            hostNameColumn,
            [hostName]
        ),
        Appwrite.Query.equal(
            systemTypeColumn,
            [systemType]
        ),
        Appwrite.Query.limit(1)
    ];
    return appwriteListRows(SHOP_COLLECTION_ID, query)
        .then(function (rows) {
            return rows;
        }).catch(function () {
            throw new Error(ERROR_MESSAGE.domain);
        });
}

function appwriteListRows(tableId, queries = []) {
    return tablesDB.listRows(APPWRITE_CONFIG.databaseId, tableId, queries)
        .then((response) => {
            if (!response || !response.rows) {
                return [];
            }
            return response.rows;
        });
}

function assertAppwriteConfigured() {
    if (!APPWRITE_CONFIG.url || !APPWRITE_CONFIG.projectId || !APPWRITE_CONFIG.databaseId || !SHOP_COLLECTION_ID) {
        throw new Error("Appwrite is not configured properly.");
    }
}
