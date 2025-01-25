from pathlib import Path

import scrapy


class NovelasSpider(scrapy.Spider):
    name = "novelas"

    def start_requests(self):
        urls = [
            "https://memoriaglobo.globo.com/entretenimento/novelas/",
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        anchors = response.css("div.show-indice-artistas-az-section-items > section > ul > li  > a")
        yield from response.follow_all(anchors, callback=self.parse_novela)

    def parse_novela(self, response):
        yield response.follow('noticia/ficha-tecnica.ghtml', callback=self.parse_ficha_tecnica)
    
    def parse_ficha_tecnica(self, response):
        def extract_with_css(query):
            return response.css(query).get(default="").strip()
        def extract_all_with_css(query):
            return response.css(query).getall()
        def extract_with_xpath(query):
            return response.xpath(query).get(default="").strip()
        
        novela = extract_with_css("#header-tabs-navigation > ul > li:nth-child(1) > a::text")
        #https://memoriaglobo.globo.com/entretenimento/novelas/gente-fina/noticia/ficha-tecnica.ghtml
        #article > div:nth-child(4) > div:nth-child(1) > div > p::text
        ficha_tecnica = extract_all_with_css("article > div:nth-child(4) > div > p::text")
        
        if not ficha_tecnica:
            ficha_tecnica = extract_all_with_css("article > div:nth-child(4) > div:nth-child(1) > div > p::text")
        if not ficha_tecnica:
            ficha_tecnica = extract_all_with_css("article > div:nth-child(4) > div:nth-child(1) > div > ul > li::text")
        if not ficha_tecnica:
            ficha_tecnica = extract_all_with_css("article > div:nth-child(4) > div:nth-child(2) > div > p::text")
        if not ficha_tecnica:
            ficha_tecnica = extract_all_with_css("article > div:nth-child(4) > div:nth-child(2) > div > div > p::text")
        if not ficha_tecnica:
            ficha_tecnica = extract_all_with_css("article > div:nth-child(5) > div > p::text")

        yield {
            "novela": novela,
            "ficha_tecnica": ficha_tecnica
        }