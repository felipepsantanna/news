import Groq from "groq-sdk";


export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Not Authorize' })
        return
    }
    try {
        const item = req.body;
        const chatTitle = await getGroqChatCompletion("parafraseie o título, escolha a melhor opção para um title SEO e me devolva apenas o texto da melhor opção" + item.title);
        const chatDescription = await getGroqChatCompletion(`Você é um assistente de SEO especializado com foco em criação de conteúdos otimizados para ranquear em mecanismos de busca. Você é capaz de gerar textos que sigam práticas avançadas de SEO semantico.
Substitua todos as tags de títulos e subtitúlos(h3, h4, h5 e h6) pela tag h2
Não use emojis. Agora parafraseie o texto, mantenha as tags html, remova todos os links e remova a parte 'ATENÇÃO: O post apareceu primeiro em', retorne apenas com o artigo que será publicado do seguinte texto:` + item.description);
        //Sempre que possível, crie pelo menos um link para algum artigo em noticiasdofla.com.br, não crie para a home do site, apenas para outro artigo interno, você precisa conferir se esse artigo existe no site noticiasdofla.com.br.
        const resp = {
            source: 1,
            title: chatTitle.choices[0]?.message?.content,
            link: item.link,
            description: chatDescription.choices[0]?.message?.content
        }

        return res.status(200).json(resp);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err)
    }

}



export async function getGroqChatCompletion(message) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: message,
            },
        ],
        model: process.env.GROQ_MODEL,
    });
}