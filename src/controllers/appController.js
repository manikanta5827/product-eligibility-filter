const logger = require('../utils/winstonLogger.js');

const createOffer = (req,res) =>{

    res.status(201).json({
        status: "success",
        message: "offer saved successfully"
    })
}

const uploadleads = async(req,res) =>{
    res.status(201).json({
        status: "success",
        message: "leads uplaoded successfully"
    })
}

const runScores = async(req,res)=>{
    res.status(201).json({
        status: "success",
        message: "scores runned successfully"
    })
}

const getResults = (req,res)=>{
    logger.info('results fetched successfully');
    res.status(200).json({
        status: "success",
        message: "results fetched successfully"
    })
}

module.exports = { createOffer, uploadleads, runScores, getResults };