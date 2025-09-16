const logger = require('../utils/winstonLogger.js');
const csv = require('csv-parser');
const { Readable } = require("stream");
const { Parser } = require("json2csv");
const { computeRuleScore, callLLM, mapIntentToPoints } = require('../services/appService.js');

let offer = null;
let leads = [];
let results = [];

const createOffer = (req, res) => {
    let body = req.body;
    if (!body.name) {
        return res.status(400).json({
            status: "error",
            message: "missing name field"
        });
    }

    if (!body.value_props) {
        return res.status(400).json({
            status: "error",
            message: "missing value_props field"
        });
    }

    if (!body.ideal_use_cases) {
        return res.status(400).json({
            status: "error",
            message: "missing ideal_use_cases field"
        });
    }

    offer = body;

    return res.status(201).json({
        status: "success",
        message: "offer saved successfully"
    });
}

const uploadleads = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: "error",
            message: "no file uploaded"
        })
    }

    const stream = Readable.from(req.file.buffer);

    let rows = 0;
    leads = [];

    stream
        .pipe(csv())
        .on("data", (row) => {
            // console.log(row);
            if (row.name && row.role && row.industry) {
                // console.log('inside');
                leads.push({ id: rows++, ...row })
            }
        })
        .on('end', () => {
            console.log(leads);
            return res.status(201).json({
                status: "success",
                message: "leads uplaoded successfully",
                uploads: leads.length
            })
        })
}

const runScores = async (req, res) => {
    if (!offer) {
        return res.status(400).json({
            status: "error",
            message: "no offer set"
        });
    }

    if (leads.length == 0) {
        return res.status(400).json({
            status: "error",
            message: "no leads set"
        })
    }

    for (const lead of leads) {
        logger.info(`triggered lead`)
        const rule_score = computeRuleScore(offer, lead);
        logger.info(`manual score calculated ${rule_score}`)
        const aiResp = await callLLM(offer, lead);
        const ai_points = mapIntentToPoints(aiResp.intent);
        logger.info(`llm score calculated ${aiResp.intent}`)
        const final_score = rule_score + ai_points;
        logger.info('final score calculated')
        results.push({
            ...lead, intent: aiResp.intent, score: final_score, reasoning: aiResp.explanation, created_at: new Date()
        });
    }
    results.sort((a, b) => b.score - a.score);
    res.status(201).json({
        status: "success",
        message: "scores runned successfully",
        results
    })
}

const getResults = (req, res) => {
    res.status(200).json({
        status: "success",
        message: "results fetched successfully",
        product: results
    })
}

const getCsvResults = (req,res) => {
    const fields = ["name", "role", "company", "industry", "location", "linkedin_bio", "intent", "score", "reasoning", "created_at"];
    const parser = new Parser({ fields });
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("data.csv");
    res.send(csv);
}

module.exports = { createOffer, uploadleads, runScores, getResults , getCsvResults};