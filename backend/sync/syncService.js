import isOnline from 'is-online';

import { syncCustomers } from './syncCustomers.js';
import { syncProducts } from './syncProducts.js';
import { syncInvoices } from './syncInvoices.js';

export const startAutoSync = () => {

  setInterval(async () => {

    if (await isOnline()) {

      console.log("Online — syncing data...");

      await syncCustomers();
      await syncProducts();
      await syncInvoices();

      console.log("Sync complete ✔");

    } else {
      console.log("Offline — sync skipped");
    }

  }, 30000); // every 30 seconds

};