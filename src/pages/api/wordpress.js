import { createConnection } from "@/lib/db.js";
import { Tourney } from "next/font/google";
export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Not Authorize' })
        return
    }
    try {
        const item = req.body;
        if (item === null)
            return res.status(500).json({ message: "post not received" });
        var imgID;
        if (item.img === undefined || item.img === null) {
            imgID == 30;
        }
        const url = toUrl(item.title);

        const db = await createConnection();
        let insertQuery = `insert into wp_posts (post_author, post_date, post_date_gmt, 
                                            post_content, post_title, post_excerpt, post_status, 
                                            comment_status, ping_status,post_password, 
                                            post_name, to_ping, pinged, post_modified, 
                                            post_modified_gmt,post_content_filtered,
                                            post_parent, guid, menu_order, post_type, 
                                            post_mime_type, comment_count)
                                    values (1, NOW(), NOW(),
                                            '${item.description.replaceAll('\"', '\\"')}','${item.title.replaceAll('\"', '\\"')}', '', 'publish',
                                            'open', 'open', '' ,
                                            '${url}', '', '', NOW(),
                                            NOW(),'',
                                            0, '', 0, 'post',
                                            '', 0)`;
        const [respInsert] = await db.query(insertQuery);

        if (respInsert.insertId > 0) {
            //add imagem
            const insMeta = `INSERT INTO wp_postmeta(post_id, meta_key, meta_value) VALUES (${respInsert.insertId},'_thumbnail_id','72')`;
            const [respInsMeta] = await db.query(insMeta);
            //add category    
            const intCat = `INSERT INTO wp_term_relationships(object_id, term_taxonomy_id, term_order) VALUES (${respInsert.insertId} , 3 , 0)`;
            const [respIntCat] = await db.query(intCat);

        }
        return res.status(200).json({ message: insertQuery });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err)
    }
}

function toUrl(texto) {
    texto = texto.replaceAll(" / ", "/");
    texto = texto.replaceAll(" \\ ", "\\");
    texto = texto.replaceAll('.', '-');
    texto = texto.replaceAll('/', '-');

    // Substitui múltiplos espaços por um único hífen
    texto = texto.replaceAll(/\s+/g, "-").trim();

    // Remove acentos e caracteres especiais
    const comAcento = "áâãàéêëíóôõúüçÁÂÃÀÉÊËÍÓÔÕÚÜÇ";
    const semAcento = "aaaaeeeiooouucAAAAEEEIOOOUUC";

    for (let i = 0; i < comAcento.length; i++) {
        const regex = new RegExp(comAcento[i], 'g');
        texto = texto.replaceAll(regex, semAcento[i]);
    }

    // Remove tudo que não for alfanumérico, barra ou hífen (-)
    texto = texto.replaceAll(/[^a-zA-Z\d\-/]/g, "");

    // Substitui múltiplos hífens por um único
    texto = texto.replaceAll(/-+/g, "-");

    texto = texto.replaceAll(/[-.!@#$%&/{()}=?+]+$/g, '');

    return texto.toLowerCase();
}