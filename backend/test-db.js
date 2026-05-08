const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB!");
        try {
            const admin = mongoose.connection.db.admin();
            const dbs = await admin.listDatabases();
            console.log("Databases:", dbs.databases.map(d => d.name));

            for (const dbInfo of dbs.databases) {
                if (dbInfo.name === 'admin' || dbInfo.name === 'local') continue;
                console.log(`\nCollections in ${dbInfo.name}:`);
                const db = mongoose.connection.client.db(dbInfo.name);
                const cols = await db.listCollections().toArray();
                for (const col of cols) {
                    const count = await db.collection(col.name).countDocuments();
                    console.log(` - ${col.name}: ${count} documents`);
                }
            }
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error("Connection error:", err);
        process.exit(1);
    });
