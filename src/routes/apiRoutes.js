const express = require("express");
const path = require("path");
const { off } = require("process");
const router = express.Router();

router.post("/tenders/add", (req, res) => {
    const { nazwa_instytucji, name, description, start_date, end_date, max_offer } = req.body;
    console.log("Received data:", req.body);
    if (!nazwa_instytucji || !name || !description || !start_date || !end_date || !max_offer) {
        return res.status(400).send("All fields are required");
    }

    const query = `
        INSERT INTO tenders (author , name,  description, start_date, end_date, max_offer)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    req.db.run(query, [nazwa_instytucji, name, description, start_date, end_date, max_offer], function (err) {
        if (err) {
            console.error("Error adding tender:", err.message);
            return res.status(500).send("Internal Server Error");
        }

        res.status(201).send({ message: "Tender added successfully", tenderId: this.lastID });
    });
});

router.post("/offer/add/:id", (req, res) => {
    const tenderId = req.params.id;
    const currentDateTime = new Date().toISOString();

    const tenderQuery = "SELECT * FROM tenders WHERE id = ?";
    req.db.get(tenderQuery, [tenderId], (err, tender) => {
        if (err) {
            console.error("Error fetching tender:", err.message);
            return res.status(500).send("Internal Server Error");
        }

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

        req.db.run(query, [tenderId, offer_amount, currentDateTime, offerer_name], function (err) {
            if (err) {
                console.error("Error adding Offer:", err.message);
                return res.status(500).send("Internal Server Error");
            }

            res.status(201).send({ message: "Offer added successfully", offerId: this.lastID });
        });
    });
});




module.exports = router;