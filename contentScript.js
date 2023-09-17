
// // Buraya istediğiniz JavaScript kodunu ekleyin
// console.log("Amazon Otomasyon Eklentisi çalışıyor!");


// // Headers API yerine düz bir nesne kullanıyoruz
// var headers = {
//     "Cookie": "i18n-prefs=TRY; session-id=261-9021802-4781236; session-id-time=2082787201l; session-token=\"3HAW/zR0oSyR1voZ3VZlu1wIbh/TgjhWkZTfbQuqnID1hyK4HqfIMI7us4DaplB5Tr9AC/AdC+ONS1QOnwtsfTdctxuFkUzC5Dc1n0rYljbrPnoodPVMekz2r+DAadXB859k1+kD9rRaFNyWCRZjFfJ4vfLfgWakf4mRh1wso0kXwIzAYT4iF4ixa3zPMCKqb3MiiG9qQg72zt8CNQjE940t/qkP/pi3fCaAQspHAQFCmjGXAKcfBSdSVqBTyFIIfdL2TBONvmx1I5NorDDPg9yelajGCJd24aNPc5MnoJggQoB9UE7o4IAb0TsKVEKXa/2m0KtTNCcQaYYpXa3S3WF/GHQwf4nybfzTsmv5/B0=\"; ubid-acbtr=261-2589003-7068136"
//   };
  
// function fetchData(page) {
//   return fetch(`https://www.amazon.com.tr/s?i=computers&page=${page}`, {
//     method: 'GET',
//     headers: headers,
//     redirect: 'follow'
//   })
//   .then(response => response.text())
// }
// function extractData(html) {
//   let parser = new DOMParser();
//   let doc = parser.parseFromString(html, "text/html");
//   let asins = Array.from(doc.querySelectorAll("div[data-asin]"))
//                    .map(div => div.getAttribute("data-asin"))
//                    .filter(asin => asin.trim() !== "");  // Boş değerleri filtreleyin
//   return asins;
// }


// function getTotalPages(html) {
//   let parser = new DOMParser();
//   let doc = parser.parseFromString(html, "text/html");

//   // toplam sayfa sayısını buluyoruz
//   let lastPageElem = doc.querySelector("span.s-pagination-item.s-pagination-disabled");
//   return lastPageElem ? parseInt(lastPageElem.textContent.trim()) : 1;
// }

// fetchData(2).then(html => {
//   let totalPages = getTotalPages(html);
//   let allAsins = [];

//   for (let i = 2; i <= totalPages; i++) {
//     fetchData(i).then(pageHtml => {
//       let asins = extractData(pageHtml);
//       allAsins = allAsins.concat(asins);

//       if (i === totalPages) {
//         console.log(allAsins);  // Tüm ASIN değerleri bu array içerisinde olacak

//         // Eğer tarayıcıda çalışıyorsanız ve bu değerleri txt dosyasına kaydetmek istiyorsanız
//         // aşağıdaki kodu kullanabilirsiniz:
//         let blob = new Blob([allAsins.join('\n')], { type: 'text/plain' });
//         let a = document.createElement('a');
//         a.href = URL.createObjectURL(blob);
//         a.download = 'asins.txt';
//         a.click();
//       }
//     });
//   }
// });

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
  
      function fetchData(baseURL, page) {
      const urlWithPage = `${baseURL}&page=${page}`;
      console.log("Fetching data from:", urlWithPage); // Debug: Hangi URL'den veri çekiliyor kontrolü
      return fetch(urlWithPage, {
          method: 'GET',
          headers: headers,
          redirect: 'follow'
      })
      .then(response => response.text())
  }

  function extractData(html) {
    console.log("Extracting data from HTML"); // Debug: Veri çıkarma işlemi kontrolü
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");
      let asins = Array.from(doc.querySelectorAll("div[data-asin]"))
                      .map(div => div.getAttribute("data-asin"))
                      .filter(asin => asin.trim() !== "");
      // console.log("Extracted ASINs:", asins); // Debug: Çıkarılan ASIN'ler kontrolü
      return asins;
  }

  function getTotalPages(html) {
    console.log("Getting total pages from HTML"); // Debug: Toplam sayfa sayısı alma işlemi kontrolü
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");
      // let lastPageElem = doc.querySelector("span.s-pagination-item.s-pagination-disabled");
      let elements = document.querySelectorAll("span.s-pagination-item.s-pagination-disabled");

      let lastPageElem = null;

      // Elementleri dön
      elements.forEach(element => {
          try {
              // Elementin içeriğini integer (tam sayı) olarak çevir
              let number = parseInt(element.textContent);

              // Eğer çevirme işlemi başarılı ise, lastPageElem olarak atama yap ve döngüden çık
              if (!isNaN(number)) {
                  lastPageElem = element;
                  throw new Error("Çıkış");
              }
          } catch (error) {
              // Çevirme işlemi başarısız olursa veya zaten bir lastPageElem atandıysa, devam et
              if (error.message !== "Çıkış") {
                  console.error("Hata:", error);
              }
          }
      });

      console.log(lastPageElem.textContent);
      let totalPages = lastPageElem ? parseInt(lastPageElem.textContent.trim()) : 1;
      console.log("Total pages:", totalPages); // Debug: Toplam sayfa sayısı kontrolü
      return totalPages;
  }

  fetchData(urlToFetch, 1).then(html => {
    let totalPages = getTotalPages(html);
    let allAsinsSet = new Set(); // Küme oluşturuldu.

    for (let i = 1; i <= totalPages; i++) {
        fetchData(urlToFetch, i).then(pageHtml => {
            let asins = extractData(pageHtml);
            asins.forEach(asin => allAsinsSet.add(asin)); // Her ASIN, küme'ye eklenir.

            if (i === totalPages) {
                let allAsins = Array.from(allAsinsSet); // Küme, diziye dönüştürülür.

                console.log(allAsins);

                let blob = new Blob([allAsins.join('\n')], { type: 'text/plain' });
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'asins.txt';
                a.click();
            }
        });
    }
  });
}
