import { createConnection } from "@/lib/db.js";
export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Not Authorize' })
        return
    }

    const item = req.body;
    if (item === null)
        return res.status(500).json({ message: "link not received" });

    const db = await createConnection();
    let query = `select * from control where link = '${item.link}' `;
    const [results] = await db.query(query);
    if (results !== null && results.length > 0)
        return res.status(200).json(results);

    let insertQuery = `insert into control (source, link) values (${item.source}, '${item.link}')`;
    const [respInsert] = await db.query(insertQuery);

    return res.status(201).json({ message: "ok" });
}

