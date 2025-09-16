const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/winstonLogger');
require('dotenv').config();

if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set. Add it to your environment or a .env file.');
}

const decisionMakers = new Set(["ceo", "founder", "co-founder", "head", "vp", "director", "cto", "cio", "managing director"]);
const influencers = new Set(["manager", "lead", "senior", "principal", "specialist"]);

const computeRuleScore = (offer, lead) => {
    let role_points = 0;
    let industry_points = 0;
    let completeness_points = 0;

    logger.info(`cr 1`)
    role_points = getRolePoints(lead);
    industry_points = getIndustryPoints(offer, lead);
    completeness_points = getCompletenessPoints(lead);
    logger.info(`role_points::${role_points} industry_points::${industry_points} completeness_points::${completeness_points}`)

    return role_points + industry_points + completeness_points;
}

const callLLM = async (offer, lead) => {
    // logger.info(`llm 1 ${JSON.stringify(offer)} ${JSON.stringify(lead)}`)
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const prompt = generatePrompt(offer, lead);
    // logger.info(`llm 2`)
    const { text: response } = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });

    // logger.info(response);
    let cleaned = response
        .replace(/```json\s*/gi, '')
        .replace(/```/g, '')
        .trim();
    logger.info(cleaned);
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        logger.error(`Failed to parse LLM response as JSON: ${err?.message}\nRaw: ${response}\nCleaned: ${cleaned}`);
        throw err;
    }
}

const mapIntentToPoints = (aiIntent) => {
    switch (aiIntent.toLowerCase()) {
        case 'high':
            return 50
        case 'medium':
        case 'med':
            return 30
        case 'low':
            return 10
        default:
            return 0
    }
}

function getRolePoints(lead) {
    let role = lead.role.toLowerCase();

    if (decisionMakers.has(role)) return 20;
    else if (influencers.has(role)) return 10;
    else return 0;
}

function getIndustryPoints(offer, lead) {
    const offerIndustries = offer.ideal_use_cases[0].toLowerCase().split(" ");
    const leadIndustry = (lead?.industry || '').toLowerCase();
    console.log(offerIndustries);
    console.log(leadIndustry);
    if (!leadIndustry || offerIndustries.length === 0) return 0;
    return offerIndustries.includes(leadIndustry) ? 20 : 0;
}

function getCompletenessPoints(lead) {
    const { name: leadName, role, company, industry, location, linkedin_bio } = { ...lead };
    if (leadName && role && company && industry && location && linkedin_bio) return 10;
    else return 0;
}

function generatePrompt(offer, lead) {
    return `You are an expert B2B SDR. Given the product offer and a prospect's details, classify the prospect's buying intent as exactly one of [high, medium, low], then in 1 sentence explain why.
    product Offer:
    name: ${offer.name}
    value props: ${offer.value_props}
    ideal use cases: ${offer.ideal_use_cases}
    user data:
    name: ${lead.name}
    role: ${lead.role}
    company: ${lead.company ?? ''}
    industry: ${lead.industry}
    location: ${lead.location ?? ''}
    linkedin_bio: ${lead.linkedin_bio ?? ''}

    Output JSON only:
    {
    "intent": "<high|medium|low>",
    "explanation": "<1 sentence reasoning>"
    }
`
}

module.exports = { computeRuleScore, callLLM, mapIntentToPoints };