const express = require("express");
const path = require("path");
const { off } = require("process");
const router = express.Router();
const { getAllFinishedTenders, getAllNonFinishedTenders, findTenderById } = require("../model/tenderModel.js");
const { getOffersForTender} = require("../model/offerModel.js");

router.get("/tenders", (req, res) => {
    const currentDateTime = new Date().toISOString();

    getAllNonFinishedTenders(req.db, currentDateTime).then((rows)=>{
        res.render("tenders", { tenders: rows });
    }).catch(err =>{
        console.error("Error fetching tenders:", err.message);
        return res.status(500).send("Internal Server Error");
    })
});

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/archive", (req, res) => {
    const currentDateTime = new Date().toISOString();

    getAllFinishedTenders(req.db, currentDateTime).then((rows) => {
        res.render("archive", { tenders: rows });
    }).catch(err => {
        console.error("Error fetching tenders:", err.message);
        return res.status(500).send("Internal Server Error");
    })

});


router.get("/tender/:id", (req, res) => {
    const tenderId = req.params.id;

    findTenderById(req.db,tenderId).then((tender)=>{
        if (!tender) {
            return res.status(404).send("Tender not found");
        }
        const currentDateTime = new Date().toISOString();
        if (currentDateTime < tender.start_date) {
            return res.render("tenderDetails", { tender: tender, isFinished: false, notStartedYet: true });
        }
        if (tender.end_date < currentDateTime) {
            getOffersForTender(req.db, tenderId).then((rows)=>{
                rows.filter((offer) => offer.amount <= tender.max_offer);
                rows.sort((a, b) => a.amount - b.amount)
                return res.render("tenderDetails", { tender: tender, isFinished: true, offers: rows, notStartedYet: false });
            }).catch(err=>{
                console.error("Error fetching offers:", err.message);
                return res.status(500).send("Internal Server Error");
            })
        }
        if (tender.end_date > currentDateTime)
        {
            return res.render("tenderDetails", { tender: tender, isFinished: false, notStartedYet: false });
        } 
    }).catch(err=>{
        console.error("Error fetching tender:", err.message);
        return res.status(500).send("Internal Server Error");
    })

});

router.get("/add", (req, res) => {
    res.render("addTender");
});




module.exports = router;