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
        def extract_with_css(query):
            return response.css(query).get(default="").strip()
        
        novela = extract_with_css("span.bstn-hl-title::text")

        ficha_tecnica = extract_with_css("div.mc-column.content-text.active-extra-styles::text")

        yield {
            "novela": novela,
            "ficha_tecnica": ficha_tecnica,
        }