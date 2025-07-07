import { createConnection } from "@/lib/db.js";
import axios from 'axios';
import FormData from 'form-data';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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

            const response = await fetch(item.link);
            const html = await response.text();
            const $ = cheerio.load(html);

            const imageUrl = $('.featured-lightbox-trigger img').attr('src');
            const imageTitle = $('.featured-lightbox-trigger').attr('data-caption');

            // Baixa a imagem
            const imageDownloadResponse = await fetch(imageUrl);
            const imageBuffer = await imageDownloadResponse.arrayBuffer();
            const imageNodeBuffer = Buffer.from(imageBuffer);

            const formData = new FormData();
            const filename = `${url}.png`;
            const contentType =
                imageDownloadResponse.headers.get('content-type') || 'application/octet-stream';

            formData.append('file', imageNodeBuffer, {
                filename,
                contentType,
            });
            formData.append('title', imageTitle);

            // Autenticação básica
            const auth =
                'Basic ' +
                Buffer.from(
                    `${process.env.WORDPRESS_API_USERNAME}:${process.env.WORDPRESS_APPLICATION_PASSWORD}`
                ).toString('base64');

            // Faz o upload com axios
            const mediaApiUrl = `${process.env.WORDPRESS_BASE_URL}/wp-json/wp/v2/media`;

            try {
                const uploadResponse = await axios.post(mediaApiUrl, formData, {
                    headers: {
                        Authorization: auth,
                        ...formData.getHeaders(), // axios cuida do Content-Length corretamente
                    },
                });

                const uploadedImageData = uploadResponse.data;
                const uploadedImageId = uploadedImageData.id;

                console.log(`Imagem ${uploadedImageId} enviada com sucesso para o WordPress.`);

                // Atualiza o post
                const postApiUrl = `${process.env.WORDPRESS_BASE_URL}/wp-json/wp/v2/posts/${respInsert.insertId}`;

                await axios.post(
                    postApiUrl,
                    { featured_media: uploadedImageId },
                    {
                        headers: {
                            Authorization: auth,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            } catch (err) {
                if (err.response) {
                    console.error('Erro detalhado do upload para WordPress:', err.response.data);
                    throw new Error(
                        `Falha ao fazer upload da imagem para o WordPress: ${err.response.status} - ${err.response.data.message || 'Erro desconhecido'}`
                    );
                } else {
                    console.error('Erro inesperado:', err);
                    throw err;
                }
            }

            //const insMeta = `INSERT INTO wp_postmeta(post_id, meta_key, meta_value) VALUES (${respInsert.insertId},'_thumbnail_id','72')`;
            //const [respInsMeta] = await db.query(insMeta);
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