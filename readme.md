# auto-ddns (v1.0.0)

**Author:** Dustin Palmatier

**Date:** November 12, 2024

**Description:**

This program is designed to automatically update your Dynamic DNS (DDNS) records with your current public IP address.

**Features:**

- **Automated updates:** Regularly checks for changes in your public IP address.
- **Cloudflare integration:** Updates DNS records with Cloudflare.
- **Caching:** Caches the last known public IP address to minimize unnecessary updates.
- **Logging:** Provides detailed log messages with timestamps and information about the update process.

**Installation:**

1. **Configure:** Appropriately assign the configuration settings locating in the `source/global.ts` file
2. **Build:** Run `npm run cycle` or `npm run build` to build your project. The first will automatically run it after build.
3. **Run:** Execute the program using `npm run start` in the `dist` folder.

**Log Example:**

The provided log snippet demonstrates a typical execution of the program:

- **Initialization:** Indicates the start of the service and the intention to check for IP address updates.
- **IP Address Retrieval:** Shows the process of obtaining the current public IP address.
- **DNS Record Lookup:** Retrieves existing DNS records from the provider.
- **Record Update:** If necessary, updates the DNS record with the new IP address.
- **No Change:** Indicates that the IP address has not changed and no updates are required.

**Disclaimer:**

- Always test thoroughly in a non-production environment before deploying in production.
- The author is not responsible for any issues or damages that may arise from the use of this program.
