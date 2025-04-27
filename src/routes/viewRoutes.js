const express = require("express");
const path = require("path");
const { off } = require("process");
const router = express.Router();

router.get("/tenders", (req, res) => {
    const currentDateTime = new Date().toISOString();
    const query = "SELECT * FROM tenders WHERE end_date > ?";

    req.db.all(query, [currentDateTime], (err, rows) => {
        if (err) {
            console.error("Error fetching tenders:", err.message);
            return res.status(500).send("Internal Server Error");
        }

        res.render("tenders", { tenders: rows });
    });
});

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/archive", (req, res) => {
    const currentDateTime = new Date().toISOString();
    const query = "SELECT * FROM tenders WHERE end_date < ?";

    req.db.all(query, [currentDateTime], (err, rows) => {
        if (err) {
            console.error("Error fetching tenders:", err.message);
            return res.status(500).send("Internal Server Error");
        }

        res.render("archive", { tenders: rows });
    });
});


router.get("/tender/:id", (req, res) => {
    const tenderId = req.params.id;

    const query = "SELECT * FROM tenders WHERE id = ?";

    req.db.get(query, [tenderId], (err, row) => {
        if (err) {
            console.error("Error fetching tender:", err.message);
            return res.status(500).send("Internal Server Error");
        }

        if (!row) {
            return res.status(404).send("Tender not found");
        }
        const currentDateTime = new Date().toISOString();
        if (currentDateTime < row.start_date) {
            return res.render("tenderDetails", { tender: row, isFinished: false  , notStartedYet: true});
        }
        if (row.end_date < currentDateTime) {
            const offersQuerry = "SELECT * FROM offers WHERE tender_id = ?";
            req.db.all(offersQuerry, [tenderId], (err, rows) => {
                if (err) {
                    console.error("Error fetching offers:", err.message);
                    return res.status(500).send("Internal Server Error");
                }
                rows.filter((offer) => offer.amount <= row.max_offer);
                rows.sort((a, b) => a.amount - b.amount)
                return res.render("tenderDetails", { tender: row, isFinished: true, offers: rows, notStartedYet: false });
            })
        }
        if (row.end_date > currentDateTime) {
            return res.render("tenderDetails", { tender: row, isFinished: false, notStartedYet: false });
        } 

    });
});

router.get("/add", (req, res) => {
    res.render("addTender");
});




module.exports = router;