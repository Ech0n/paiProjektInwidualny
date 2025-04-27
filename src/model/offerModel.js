export function getOffersForTender(db, tenderId) {
    return new Promise((resolve, reject) => {
        const offersQuerry = "SELECT * FROM offers WHERE tender_id = ?";
        db.all(offersQuerry, [tenderId], (err, offers) => {
            if (err) {
                return reject(err);
            }
            resolve(offers);
        });
    });
};

export function addOffer(db, {tenderId, offer_amount, currentDateTime, offerer_name}) {
    return new Promise((resolve, reject) => {

        const query = `
            INSERT INTO offers (tender_id, amount, submission_date, offerer_name)
            VALUES (?, ?, ?, ?)
        `;

        db.run(query, [tenderId, offer_amount, currentDateTime, offerer_name], function (err) {
            if (err) {
                return reject(err)
            }
            resolve(this.lastID)
        });
    });
};


