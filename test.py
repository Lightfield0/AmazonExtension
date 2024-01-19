from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup

from selenium import webdriver
from bs4 import BeautifulSoup
import time

BASE_URL = "https://www.amazon.com.mx/s?k=kitchen&i=kitchen&crid=ZUED7N5V1JSN&sprefix=kitchwen%2Ckitchen%2C517&ref=nb_sb_ss_ts-doa-p_1_8&page={}"

driver = webdriver.Firefox()

asins = set()
links = set()

for page_number in range(1, 401):  # 1'den 401'e kadar sayfaları dolaşıyoruz

    url = BASE_URL.format(page_number)
    driver.get(url)
    
    
    # Sayfa kaynağını BeautifulSoup ile ayrıştırma
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # 'data-asin' özniteliğini topluyoruz
    elements = soup.find_all("div", attrs={"data-asin": True})
    for elem in elements:
        asins.add(elem["data-asin"])

    # Ürün linklerini topluyoruz
    elements2 = soup.find_all("a", class_="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal")
    for elem2 in elements2:
        links.add(elem2["href"])

driver.quit()

# Toplanan 'data-asin' değerlerini ve linkleri ekrana yazdırıyoruz
print("Toplanan ASIN sayısı:", len(asins))
print("Toplanan Link sayısı:", len(links))
