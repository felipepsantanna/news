import Groq from "groq-sdk";


export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Not Authorize' })
        return
    }
    try {
        const item = req.body;
        const chatTitle = await getGroqChatCompletion("parafraseie o título, escolha a melhor opção para um title SEO e me devolva apenas o texto da melhor opção" + item.title);
        const chatDescription = await getGroqChatCompletion("parafraseie o texto com as melhores técnicas de SEO semantico e SEO técnico, mantenha as tags html, remova todos os links e remova a parte 'ATENÇÃO: O post apareceu primeiro em': " + item.description);

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