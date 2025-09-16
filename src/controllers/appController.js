const logger = require('../utils/winstonLogger.js');
const csv = require('csv-parser');
const { Readable } = require("stream");

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
    if (!req.file){
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
            if(row.name && row.company && row.role && row.industry && row.location && row.linkedin_bio) {
                // console.log('inside');
                leads.push({id:rows++, ...row})
            }
        })
        .on('end',()=>{
            console.log( leads);
            return res.status(201).json({
                status: "success",
                message: "leads uplaoded successfully",
                uploads: leads.length
            })
        })
}

const runScores = async (req, res) => {
    res.status(201).json({
        status: "success",
        message: "scores runned successfully",
        results
    })
}

const getResults = (req, res) => {
    logger.info('results fetched successfully');
    res.status(200).json({
        status: "success",
        message: "results fetched successfully",
        product: results
    })
}

module.exports = { createOffer, uploadleads, runScores, getResults };