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

  const parafrasear = items.map((item) => ({
    source: 1,
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    description: item["content:encoded"].replace(item["content:encoded"].split("<hr />")[0], "")
  }));


  for (var i = 0; i < parafrasear.length; i++) {
    const todo = await fetch(`${process.env.FLAURL_BASE}/api/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parafrasear[i]),
    });
    console.log(todo.status);

    if (todo.status === 201) {
      //call parafrasear;
      return res.status(201).json(parafrasear[i]);
      break;
    }
    console.log(i)
  }
  return res.status(200).json(parafrasear[0].pubDate);
}
