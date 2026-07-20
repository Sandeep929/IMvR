import isOnline from 'is-online';

import { syncCustomers } from './syncCustomers.js';
import { syncProducts } from './syncProducts.js';
import { syncInvoices } from './syncInvoices.js';
import { syncSettings } from './syncSettings.js';
import { syncRawMaterials } from './syncRawMaterials.js';

export const startAutoSync = () => {
  const runSync = async () => {
    try {
      if (await isOnline()) {
        console.log("Online — syncing data...");

        await syncCustomers();
        await syncProducts();
        await syncInvoices();
        await syncSettings();
        await syncRawMaterials();

        console.log("Sync complete ✔");
      } else {
        console.log("Offline — sync skipped");
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  // Run immediately on startup
  runSync();

  // Run every 30 seconds
  setInterval(runSync, 30000);
};