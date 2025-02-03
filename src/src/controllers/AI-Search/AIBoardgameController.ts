import config from "@/config/index";

import { Request, Response } from "express";
import Configuration, { OpenAI } from "openai";

export const searchBoardgame = async (req: Request, res: Response): Promise<void> => {
    try {
        const gameName: string = req.query.name as string;

        if (!gameName) {
            res.status(400).json({ error: "Please provide a game name" });
            return;
        }

        console.log(config.chatgptKey);

        const openAI = new OpenAI({
            apiKey: config.chatgptKey
        });

        const prompt = `Tell me about the board game "${gameName}". Provide details like number of players, playtime, recommended age, and complexity rating.`;

        // // });

        const response = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
        });

        if (!response.choices || response.choices.length === 0) {
            res.status(500).json({ error: "No response from OpenAI" });
            return;
        }

        // Send the AI response to the client
        res.json({
            game_name: gameName,
            info: response.choices[0].message?.content || "No information available."
        });
    } catch (error) {
        console.error("Error fetching game info:", error);
        res.status(500).json({ error: "Failed to fetch game information" });
    }
};
