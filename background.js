chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "activateScript") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (currentTab) {
                const urlToFetch = currentTab.url;

                chrome.tabs.sendMessage(currentTab.id, {action: "startScrape", urlToFetch: urlToFetch}, (response) => {
                    if (chrome.runtime.lastError) {
                        sendResponse({status: "Hata: " + chrome.runtime.lastError.message});
                    } else {
                        sendResponse({status: "Script aktif edildi!"});
                    }
                });
            } else {
                sendResponse({status: "Hata: Aktif sekme bulunamadı."});
            }
        });
    }
    return true;
});
