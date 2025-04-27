export function addTender(db, { nazwa_instytucji, name, description, start_date, end_date, max_offer }) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO tenders (author, name, description, start_date, end_date, max_offer)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [nazwa_instytucji, name, description, start_date, end_date, max_offer], function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID);
        });
    });
}

export function findTenderById(db, tenderId) {
    return new Promise((resolve, reject) => {
        const tenderQuery = "SELECT * FROM tenders WHERE id = ?";
        db.get(tenderQuery, [tenderId], (err, tender) => {
            if (err) {
                return reject(err);
            }
            resolve(tender);
        });
    });
} 

export function getAllNonFinishedTenders(db, currentDateTime) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM tenders WHERE end_date > ?";

        db.all(query, [currentDateTime], (err, rows) => {
            if(err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

export function getAllFinishedTenders(db, currentDateTime) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM tenders WHERE end_date < ?";

        db.all(query, [currentDateTime], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}