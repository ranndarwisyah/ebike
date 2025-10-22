MyStudent E-Bike Mockup
Overview
This project is a static HTML-based mockup of the MyStudent E-Bike Campus application, designed for a university campus environment. It features a mobile-friendly interface for managing e-bike rides, including ride unlocking, live status tracking, path analysis via a Decision Support System (DSS), wallet top-up, and a rewards/penalties system. The application uses Tailwind CSS for styling, Lucide Icons for visuals, and an embedded ArcGIS map for interactive path visualization.
Features

Portal Page: A dashboard with quick access to various student services, including the E-Bike Ride feature.
E-Bike Ride: Allows users to unlock an e-bike, track ride duration, costs, and balance, with simulated location-based warnings for hazards and speed.
DSS Path Analysis: Compare travel paths (Zen, Fastest, Cheapest) with metrics like duration, safety, cost, and stress index. Includes an interactive ArcGIS map.
Wallet Top-up: Options to top up the account with points and view transaction history.
Rewards & Penalties: Displays rewards for actions like proper parking and penalties for non-designated drop-offs.
Responsive Design: Optimized for mobile devices with a max-width of 28rem.

Technologies Used

HTML5: Core structure of the application.
Tailwind CSS: For responsive and modern styling (loaded via CDN).
Lucide Icons: For lightweight and customizable icons (loaded via CDN).
JavaScript: For dynamic functionality, including ride logic, simulated location updates, and UI interactions.
ArcGIS Map: Embedded iframe for interactive path visualization (requires user login for full interactivity).
XLSX Library: For potential Excel file handling (not actively used in the current UI).

Deployment on GitHub Pages
This project is deployed on GitHub Pages, making it accessible as a static site.
Steps to Deploy

Create a Repository:

Create a new public repository on GitHub (e.g., my-student-ebike).
Ensure the repository is public for GitHub Pages to work.


Upload Files:

Upload the index.html file to the root of the repository.
Ensure the file is named index.html for GitHub Pages to recognize it as the entry point.


Enable GitHub Pages:

Go to the repository's Settings > Pages.
Set the source to the main branch and / (root) folder.
Save, and wait for the site to deploy (may take a few minutes).


Access the Site:

The site will be live at https://yourusername.github.io/repository-name/ (e.g., https://yourusername.github.io/my-student-ebike/).
Check the Pages settings for the exact URL.



Local Testing

To preview the site locally, open index.html in a web browser.
Note: Some features (e.g., ArcGIS map interactivity) require an internet connection and may prompt for login.

Usage

Accessing the App: Open the deployed URL or local index.html in a browser.
E-Bike Ride: Click the "E-Bike Ride" button on the portal page to start. Select a starting location and unlock a bike (requires 1000+ points).
DSS Path Analysis: Use the DSS tab to select start/end locations and view path recommendations. Log in to ArcGIS for map zooming and interaction.
Wallet & Rewards: Top up points in the Wallet tab and view rewards/penalties in the Rewards tab.

Notes

The ArcGIS map (embedded via iframe) requires users to log in for full interactivity (e.g., zooming, panning).
The application is a mockup; features like real-time location tracking and payment processing are simulated.
External CDNs (Tailwind CSS, Lucide Icons) are used to minimize local assets.
Ensure an internet connection for CDN-loaded assets and the ArcGIS map.

Contributing

Feel free to fork this repository and submit pull requests for improvements.
Report issues or suggest features via GitHub Issues.

License
This project is for educational purposes and is not licensed for commercial use. The ArcGIS map integration is subject to ArcGIS terms of service.
