chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startScrape") {
        const urlToFetch = request.urlToFetch;
        console.log("URL to fetch:", urlToFetch); // Debug: URL kontrolü
        scrapeAmazonData(urlToFetch);
    }
});

function scrapeAmazonData(urlToFetch) {
    console.log("Amazon Otomasyon Eklentisi çalışıyor!");

    var headers = {
        "Cookie": "i18n-prefs=TRY; session-id=261-9021802-4781236; session-id-time=2082787201l; session-token=\"3HAW/zR0oSyR1voZ3VZlu1wIbh/TgjhWkZTfbQuqnID1hyK4HqfIMI7us4DaplB5Tr9AC/AdC+ONS1QOnwtsfTdctxuFkUzC5Dc1n0rYljbrPnoodPVMekz2r+DAadXB859k1+kD9rRaFNyWCRZjFfJ4vfLfgWakf4mRh1wso0kXwIzAYT4iF4ixa3zPMCKqb3MiiG9qQg72zt8CNQjE940t/qkP/pi3fCaAQspHAQFCmjGXAKcfBSdSVqBTyFIIfdL2TBONvmx1I5NorDDPg9yelajGCJd24aNPc5MnoJggQoB9UE7o4IAb0TsKVEKXa/2m0KtTNCcQaYYpXa3S3WF/GHQwf4nybfzTsmv5/B0=\"; ubid-acbtr=261-2589003-7068136"
    };

    // Belirli bir URL'den veri çekmek için kullanılan fonksiyon
     // Belirli bir URL'den veri çekme
     async function fetchData(baseURL, page) {
        const urlWithPage = `${baseURL}&page=${page}`;
        console.log("Fetching page:", urlWithPage);
        const response = await fetch(urlWithPage, {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        });

        if (!response.ok) {
            throw new Error(`Error fetching page: ${response.statusText}`);
        }

        return response.text();
    }

    // HTML'den ASIN'leri çıkarma
    function extractData(html) {
        console.log("Extracting data from HTML");
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const asins = Array.from(doc.querySelectorAll("div[data-asin]"))
                            .map(div => div.getAttribute("data-asin"))
                            .filter(asin => asin.trim() !== "");
        console.log("Extracted ASINs:", asins);
        return asins;
    }

    // Ürün detaylarını çekme
    async function fetchProductDetails(asin) {
        console.log("Fetching product details for ASIN:", asin);
        const productUrl = `https://www.amazon.ca/dp/${asin}`;
        const response = await fetch(productUrl, {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        });

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const title = doc.querySelector("#productTitle").textContent.trim();
        const price = doc.querySelector("span.a-offscreen").textContent.trim();
        let bestSellersRank = "Rank bilgisi bulunamadı";

        // İlk olası HTML yapısını kontrol edin
        const rankDetailSections = doc.querySelectorAll('th.prodDetSectionEntry');
        rankDetailSections.forEach(section => {
            if (section.textContent.includes("Best Sellers Rank")) {
                const rankValue = section.nextElementSibling?.textContent.trim();
                if (rankValue) {
                    bestSellersRank = rankValue.split('(')[0].trim();
                }
            }
        });

        // Alternatif HTML yapısını kontrol edin
        const altRankSections = doc.querySelectorAll('span.a-text-bold');
        altRankSections.forEach(section => {
            if (section.textContent.includes("Best Sellers Rank:")) {
                const rankValue = section.nextSibling.textContent.trim();
                if (rankValue) {
                    bestSellersRank = rankValue.split('(')[0].trim();
                }
            }
        });

        console.log(`Extracted details for ASIN ${asin}:`, { title, price, bestSellersRank });

        return { asin, title, price, bestSellersRank };
    }

    // Toplam sayfa sayısını alma
    function getTotalPages(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const lastPageElem = doc.querySelectorAll("span.s-pagination-item.s-pagination-disabled")[1];

        const totalPages = lastPageElem ? parseInt(lastPageElem.textContent.trim()) : 1;
        return totalPages;
    }

    // Asenkron işlemleri yürütme
    async function performScraping() {
        try {
            const asins = extractData(document.documentElement.innerHTML);
            const allAsinsSet = new Set(asins);

            const totalPages = getTotalPages(document.documentElement.innerHTML);

            for (let i = 2; i <= totalPages; i++) {
                const pageHtml = await fetchData(urlToFetch, i);
                const pageAsins = extractData(pageHtml);
                pageAsins.forEach(asin => allAsinsSet.add(asin));
            }

            const allAsins = Array.from(allAsinsSet);
            const productDetails = await Promise.all(allAsins.map(fetchProductDetails));

            // Ürün detaylarını bir JSON dosyası olarak oluştur ve kaydet
            const productDetailsJSON = JSON.stringify(productDetails);
            const blob = new Blob([productDetailsJSON], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'productDetails.json';
            a.click();
        } catch (error) {
            console.error("Error during scraping process:", error);
        }
    }

    performScraping();
}