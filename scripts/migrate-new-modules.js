const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lakki_erp";

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for migration...");

    const db = mongoose.connection.db;

    console.log("Creating indexes for new modules...");

    // GiftCard
    await db.collection('giftcards').createIndex({ code: 1 }, { unique: true });
    await db.collection('giftcards').createIndex({ status: 1 });
    await db.collection('giftcards').createIndex({ expiresAt: 1 });

    // Layaway
    await db.collection('layaways').createIndex({ customerId: 1 });
    await db.collection('layaways').createIndex({ status: 1 });

    // MarketingCampaign
    await db.collection('marketingcampaigns').createIndex({ status: 1 });
    await db.collection('marketingcampaigns').createIndex({ startDate: 1 });
    await db.collection('marketingcampaigns').createIndex({ endDate: 1 });

    // CustomerGroup
    await db.collection('customergroups').createIndex({ isActive: 1 });

    // WarehouseTask
    await db.collection('warehousetasks').createIndex({ status: 1 });
    await db.collection('warehousetasks').createIndex({ assignedTo: 1 });

    // BulkJob
    await db.collection('bulkjobs').createIndex({ status: 1 });
    await db.collection('bulkjobs').createIndex({ createdAt: 1 });

    // OmnichannelOrder
    await db.collection('omnichannelorders').createIndex({ source: 1 });
    await db.collection('omnichannelorders').createIndex({ externalId: 1 });
    await db.collection('omnichannelorders').createIndex({ status: 1 });

    // HardwareDevice
    await db.collection('hardwaredevices').createIndex({ type: 1 });
    await db.collection('hardwaredevices').createIndex({ isActive: 1 });

    // ImeiHistory
    await db.collection('imeihistories').createIndex({ imei: 1, timestamp: -1 });

    // CommissionTransaction
    await db.collection('commissiontransactions').createIndex({ userId: 1 });
    await db.collection('commissiontransactions').createIndex({ paid: 1 });

    // ComplianceLog
    await db.collection('compliancelogs').createIndex({ type: 1 });
    await db.collection('compliancelogs').createIndex({ createdAt: 1 });

    // QualityControlInspection
    await db.collection('qualitycontrolinspections').createIndex({ type: 1 });
    await db.collection('qualitycontrolinspections').createIndex({ result: 1 });

    // RmaReturn
    await db.collection('rmareturns').createIndex({ originalSaleId: 1 });
    await db.collection('rmareturns').createIndex({ status: 1 });

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
