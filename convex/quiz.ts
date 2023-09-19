"use node"

import { v } from "convex/values"
import OpenAi from "openai"
import { Id } from "./_generated/dataModel"
import { action } from "./_generated/server"

export interface Player {
	id: string
	name: string
	img: string
}

export interface Lobby {
	_id: Id<"lobbies">
	name: string
	players: Player[]
	maxPlayers: number
	_creationTime: number
	gameId: string
}
export interface Answer {
	id: string
	value: string
}
export interface Question {
	id: string
	value: string
	answers: Answer[]
	correctAnswerId: string
}

const DUMMY_ANSWERS = [
	{ id: "a", value: "Mallorca" },
	{ id: "b", value: "United States" },
	{ id: "c", value: "Germany" },
	{
		id: "d",
		value: "England",
	},
]

const DUMMY_ANSWERS2 = [
	{ id: "a", value: "Poland" },
	{ id: "b", value: "France" },
	{ id: "c", value: "Austria" },
	{ id: "d", value: "Vatican" },
]

const DUMMY_QUESTIONS = [
	{
		id: "abc",
		value: "What country from listed below is the biggest?",
		answers: DUMMY_ANSWERS,
		correctAnswerId: "b",
	},
	{
		id: "abcd",
		value: "What country from listed below is the smallest?",
		answers: DUMMY_ANSWERS2,
		correctAnswerId: "d",
	},
]

export const getQuestions = action({
	args: { topic: v.string() },
	handler: async (_, { topic }) => {
		const apiKey = process.env.OPENAI_API_KEY

		if (!process.env.OPENAI_API_KEY) {
			return DUMMY_QUESTIONS
		}

		if (!apiKey) {
			throw new Error("No openai key provided.")
		}

		const openai = new OpenAi({
			apiKey,
		})

		const prompt = `Give me 3 uncommon questions about ${topic} in json format. Each question should have id, value, answers and correctAnswerId field. In answers field there should be 4 answers, each with id and value.`

		const {
			choices: [answer],
		} = await openai.chat.completions.create({
			temperature: 0.8,
			messages: [{ role: "user", content: prompt }],
			model: "gpt-3.5-turbo",
		})

		if (!answer.message.content) {
			throw new Error("No answer from openai.")
		}

		return JSON.parse(answer.message.content) as Question[]
	},
})
