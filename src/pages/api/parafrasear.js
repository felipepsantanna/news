import Groq from "groq-sdk";


export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Not Authorize' })
        return
    }
    const item = req.body;
    const chatTitle = await getGroqChatCompletion("parafraseie o título e me devolva apenas o texto da melhor opção" + item.title);
    const chatDescription = await getGroqChatCompletion("parafraseie o texto, mantenha as tags html e remova todos os links: " + item.description);

    console.log(chatTitle.choices[0]?.message?.content || "");
    console.log(chatDescription.choices[0]?.message?.content || "");

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