import { XMLParser } from "fast-xml-parser"
export default async function handler(req, res) {
    // Buscar o feed RSS
      const response = await fetch("https://colunadofla.com/feed", {
        next: { revalidate: 3600 }, // Revalidar a cada hora
      })
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar o feed: ${response.status}`)
      }
  
      const xml = await response.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      })
  
      // Parsear o XML
      const result = parser.parse(xml);
      const items = result.rss.channel.item;

      const flamengoNews = items.map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        description: item["content:encoded"].replace(item["content:encoded"].split("<hr />")[0], "") 
      }))


      console.log(flamengoNews);
      return res.status(200).json(flamengoNews);
  }