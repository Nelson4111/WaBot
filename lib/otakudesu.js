import axios from 'axios';
import * as cheerio from 'cheerio';

const baseUrl = 'https://otakudesu.best';

class Otakudesu {
    async home() {
        try {
            const { data } = await axios.get(baseUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            const $ = cheerio.load(data);
            const result = [];
            $('.venz ul li').each((i, el) => {
                result.push({
                    title: $(el).find('h2').text().trim(),
                    thumb: $(el).find('img').attr('src'),
                    episode: $(el).find('.epz').text().trim(),
                    uploadedOn: $(el).find('.newnime').text().trim(),
                    url: $(el).find('a').attr('href')
                });
            });
            return result;
        } catch (e) { return [] }
    }

    async search(query) {
        try {
            const { data } = await axios.get(`${baseUrl}/?s=${query}&post_type=anime`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            const $ = cheerio.load(data);
            const result = [];
            $('.chivsrc li').each((i, el) => {
                result.push({
                    title: $(el).find('h2 a').text().trim(),
                    thumb: $(el).find('img').attr('src'),
                    status: $(el).find('.set').eq(1).text().trim(),
                    url: $(el).find('h2 a').attr('href')
                });
            });
            return result;
        } catch (e) { return [] }
    }

    async detail(url) {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            const $ = cheerio.load(data);
            const info = $('.infozin .infozingle');
            const detail = {
                thumb: $('.fotoanime img').attr('src'),
                title: info.find('p:contains("Judul")').text().split(':')[1]?.trim(),
                score: info.find('p:contains("Skor")').text().split(':')[1]?.trim(),
                status: info.find('p:contains("Status")').text().split(':')[1]?.trim(),
                genre: info.find('p:contains("Genre")').text().split(':')[1]?.trim(),
                sinopsis: $('.sinopc').text().trim(),
                episodes: []
            };

            // Mengambil daftar episode (menghindari list batch)
            $('.episodelist').each((i, el) => {
                if ($(el).find('a').attr('href')?.includes('/episode/')) {
                    $(el).find('ul li').each((j, li) => {
                        detail.episodes.push({
                            title: $(li).find('a').text().trim(),
                            url: $(li).find('a').attr('href')
                        });
                    });
                }
            });
            return detail;
        } catch (e) { return null }
    }

    async episode(url) {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            const $ = cheerio.load(data);
            const download = [];
            
            $('.download ul li').each((i, el) => {
                const resolusi = $(el).find('strong').text().trim();
                const links = [];
                $(el).find('a').each((j, link) => {
                    links.push({
                        server: $(link).text().trim(),
                        url: $(link).attr('href')
                    });
                });
                if (resolusi && links.length) download.push({ resolusi, links });
            });

            return {
                title: $('.venser h1').text().trim(),
                download
            };
        } catch (e) { return null }
    }
}

export default new Otakudesu();
