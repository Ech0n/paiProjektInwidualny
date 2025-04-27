const express = require("express");
const path = require("path");
const { off } = require("process");
const router = express.Router();
const { addTender, findTenderById } = require("../model/tenderModel.js");
const {  addOffer } = require("../model/offerModel.js");

router.post("/tenders/add", (req, res) => {
    const { nazwa_instytucji, name, description, start_date, end_date, max_offer } = req.body;
    console.log("Received data:", req.body);
    if (!nazwa_instytucji || !name || !description || !start_date || !end_date || !max_offer) {
        return res.status(400).send("All fields are required");
    }

    addTender(req.db, { nazwa_instytucji, name, description, start_date, end_date, max_offer })
    .then((tenderId) => {
        res.status(201).send({ message: "Przetarg dodano pomyslnie", tenderId });
    })
    .catch((err) => {
        console.error("Error adding tender:", err.message);
        res.status(500).send("Internal Server Error");
    });
});

router.post("/offer/add/:id", (req, res) => {
    const tenderId = req.params.id;
    const currentDateTime = new Date().toISOString();

    const tenderQuery = "SELECT * FROM tenders WHERE id = ?";
    findTenderById(req.db, tenderId).then((tender)=>{
        if (!tender) {
            return res.status(404).send("Tender not found");
        }
        if (tender.end_date < currentDateTime) {
            return res.status(400).send("Cannot add offer to an expired tender");
        }

        const { offerer_name, offer_amount } = req.body;
        if (!offerer_name || !offer_amount) {
            return res.status(400).send("All fields are required");
        }

        const query = `
            INSERT INTO offers (tender_id, amount, submission_date, offerer_name)
            VALUES (?, ?, ?, ?)
        `;

        addOffer(req.db, { tenderId, offer_amount, currentDateTime, offerer_name })
        .then(index => res.status(201).send({ message: "Offer added successfully", offerId: index }))
        .catch(err=>{
            console.error("Error adding Offer:", err.message);
            return res.status(500).send("Internal Server Error");
        })
        
    }).catch((err)=>{
        console.error("Error fetching tender:", err.message);
        return res.status(500).send("Internal Server Error");
    })
});




module.exports = router;