import { XMLParser } from "fast-xml-parser"
import * as cheerio from 'cheerio';

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

  const parafrasear = items.map((item) => ({
    source: 1,
    title: item.title,
    link: item.link,
    description: item["content:encoded"].replace(item["content:encoded"].split("<hr />")[0], "")
  }));


  for (var i = 0; i < 1; i++) {
    
    const todo = await fetch(`${process.env.FLAURL_BASE}/api/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parafrasear[i]),
    });

    if (todo.status === 201) {

      const toparafrasear = await fetch(`${process.env.FLAURL_BASE}/api/parafrasear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parafrasear[i]),
      });
      const postParafrasear = await toparafrasear.json();
      if (toparafrasear.status === 200) {
        const towordpress = await fetch(`${process.env.FLAURL_BASE}/api/wordpress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postParafrasear),
        });
      } else {
        //remove from control
      }

      return res.status(201).json(parafrasear[i]);
      break;
    }
  }
  return res.status(200).json(parafrasear[0].pubDate);
}


