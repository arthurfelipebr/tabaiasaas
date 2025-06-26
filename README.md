
# Supplier Price Optimizer

A web application to track supplier prices from WhatsApp messages (or manual input) using the Google Gemini API for data extraction, helping users find the best deals for their products.

## Features

*   **AI-Powered Data Extraction**: Utilizes Google Gemini API to parse product name, price, supplier, and conditions from text messages.
*   **Price Tracking**: Stores and displays quotes from various suppliers for different products.
*   **Best Price Identification**: Automatically highlights the best current price for each product.
*   **Manual Message Entry**: Allows users to manually input supplier messages for processing.
*   **Mock WhatsApp Integration**: Simulates WhatsApp connection status and message ingestion (conceptual).
*   **Product Quote History**: View all historical quotes for a specific product.
*   **User Authentication**: Mock user login and signup system.
*   **Theme Customization**: Light and Dark mode support.
*   **Responsive Design**: Adapts to various screen sizes for a seamless experience on desktop and mobile.

## Tech Stack

*   **Frontend**: React 19, TypeScript
*   **API**: Google Gemini API (`@google/genai`)
*   **Routing**: React Router
*   **State Management**: React Context API
*   **Styling**: Tailwind CSS
*   **Icons**: Ionicons
*   **UI Components**: Custom-built reusable components

## API Key Configuration (Crucial!)

This application requires a Google Gemini API Key to function correctly. The key is accessed via `process.env.API_KEY` in the application's service layer (`services.ts`).

*   **Security**: Your Gemini API Key is sensitive. **Never commit it directly into your codebase or version control.**
*   **Environment Variable**: The `API_KEY` must be set as an environment variable in the environment where the application is **built**. Most modern JavaScript bundlers (like Vite, Webpack, Parcel used in Create React App) will replace `process.env.API_KEY` with its actual value at build time, embedding it into the static JavaScript files served to the client.

## Prerequisites

*   **Node.js**: LTS version (e.g., 18.x or 20.x) recommended. Download from [nodejs.org](https://nodejs.org/).
*   **npm** or **yarn**: Package manager (usually comes with Node.js).
*   **Google Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).
*   **(For VPS Deployment)**: A web server like Nginx or Apache.
*   **(For VPS Deployment)**: `git` for cloning the repository.

## Local Development Setup

The current project structure is minimal (`index.html`, `index.tsx`). For a robust local development experience that handles `process.env.API_KEY` correctly, you would typically use a development server and build tool (like Vite or Create React App).

1.  **Clone the Repository**:
    ```bash
    git clone <your-repository-url>
    cd supplier-price-optimizer # Or your repository name
    ```

2.  **Set up `package.json` (Recommended for managing dependencies and scripts):**
    If you don't have one, you'd typically run `npm init -y` and then install dependencies:
    ```bash
    # Example dependencies (adjust as per actual usage if it evolves)
    npm install react react-dom @google/genai react-router-dom
    npm install --save-dev typescript @types/react @types/react-dom vite # Or other build tool
    ```

3.  **Handling the API Key for Local Development:**
    *   **Using a Build Tool (e.g., Vite):**
        1.  Create a `.env` file in the project root:
            ```env
            VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
            ```
            *(Note: Vite requires the `VITE_` prefix for environment variables to be exposed to client-side code. You would then need to update `services.ts` to use `import.meta.env.VITE_API_KEY` instead of `process.env.API_KEY` if using Vite, or configure your build tool to handle `process.env.API_KEY`.)*
            For the current setup to work with `process.env.API_KEY` directly using a tool like Vite, you might need to configure `define` in `vite.config.js`:
            ```javascript
            // vite.config.js
            import { defineConfig } from 'vite'
            import react from '@vitejs/plugin-react'

            export default defineConfig({
              plugins: [react()],
              define: {
                'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
              }
            })
            ```
            And then run your dev server with the API_KEY environment variable set:
            ```bash
            API_KEY="YOUR_GEMINI_KEY" npm run dev
            ```

    *   **Without a Dedicated Build Tool (Current State - API Key Issue):**
        Directly serving `index.html` via a simple static server will **not** make `process.env.API_KEY` available in the browser; it will be `undefined`, and Gemini API calls will fail. For the current code to work as-is without a build step that replaces `process.env.API_KEY`, you would have to manually edit `services.ts` to hardcode the key (STRONGLY DISCOURAGED and insecure) or use a more advanced local server capable of injecting it.

4.  **Install Dependencies (if `package.json` is set up):**
    ```bash
    npm install
    ```

5.  **Run Development Server (if `package.json` and build tool are set up):**
    ```bash
    # Example for Vite
    API_KEY="YOUR_GEMINI_KEY" npm run dev -- --port 3005
    ```
    Or, for a simple static server (e.g., `serve` package, remember API key issue):
    ```bash
    npm install -g serve
    serve .
    ```
    The application will typically be available at `http://localhost:3005` by default.

## Deployment to VPS (Ubuntu)

This guide assumes you will build the React application into static files and serve them using Nginx.

1.  **SSH into your VPS:**
    ```bash
    ssh your_user@your_vps_ip
    ```

2.  **Install Node.js and npm (if not already installed):**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs git
    ```

3.  **Clone Your Repository:**
    ```bash
    git clone <your-repository-url> /var/www/supplier-optimizer # Or your preferred path
    cd /var/www/supplier-optimizer
    ```

4.  **Set the Gemini API Key Environment Variable for the Build Process:**
    The build process needs access to your `API_KEY`.
    One way is to set it for the current session before building:
    ```bash
    export API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    For persistence across reboots or for specific users/services, consider adding it to `~/.profile`, `/etc/environment`, or a systemd service file if your build is automated.
    **Important**: Ensure this variable is available to the shell session that runs the build command.

5.  **Install Dependencies and Build the Application:**
    *(This assumes you have a `package.json` with a `build` script that bundles your React app and handles the `process.env.API_KEY` replacement. Example build script in `package.json` using a tool like Vite or Webpack configured for `process.env` replacement):*
    ```json
    // package.json (example scripts)
    // "scripts": {
    //   "dev": "vite", // or your dev command
    //   "build": "tsc && vite build", // or your build command e.g., "webpack --mode production"
    //   "preview": "vite preview"
    // }
    ```
    Run the installation and build:
    ```bash
    npm install
    npm run build # This must use the API_KEY from the environment
    ```
    This command should generate a `dist` or `build` directory containing the static HTML, CSS, and JavaScript files.

6.  **Install and Configure Nginx:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y nginx
    ```
    Create an Nginx server block configuration file for your application:
    ```bash
    sudo nano /etc/nginx/sites-available/supplier-optimizer
    ```
    Paste the following configuration, adjusting paths and `server_name`:

    ```nginx
    server {
        listen 80;
        server_name your_domain.com www.your_domain.com your_vps_ip; # Replace with your domain or IP

        # Path to your built static files
        root /var/www/supplier-optimizer/dist; # Or 'build', depending on your build output folder
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Optional: Logging
        access_log /var/log/nginx/supplier-optimizer.access.log;
        error_log /var/log/nginx/supplier-optimizer.error.log;

        # Optional: Security headers (add more as needed)
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Optional: SSL configuration with Let's Encrypt (Certbot)
        # listen 443 ssl;
        # ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
        # ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;
        # include /etc/letsencrypt/options-ssl-nginx.conf;
        # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    }
    ```

    Enable the site by creating a symbolic link:
    ```bash
    sudo ln -s /etc/nginx/sites-available/supplier-optimizer /etc/nginx/sites-enabled/
    ```
    Test Nginx configuration and restart Nginx:
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

7.  **Configure Firewall (e.g., UFW):**
    If you have UFW enabled, allow HTTP (and HTTPS if you set up SSL):
    ```bash
    sudo ufw allow 'Nginx HTTP' # For port 80
    # sudo ufw allow 'Nginx HTTPS' # For port 443 if SSL is configured
    sudo ufw enable # If not already enabled
    sudo ufw status
    ```

8.  **Access Your Application:**
    Open your web browser and navigate to `http://your_domain.com` or `http://your_vps_ip`.

## Troubleshooting

*   **API Key Errors / Gemini Not Working**:
    *   Verify that the `API_KEY` environment variable was correctly set and accessible **during the build process on your VPS**.
    *   Inspect the generated JavaScript files (in the `dist` or `build` folder) to ensure the API key placeholder has been replaced. Be cautious not to expose this publicly.
    *   Check Nginx error logs (`/var/log/nginx/supplier-optimizer.error.log`).
    *   Open browser developer tools (Console and Network tabs) for any client-side errors.
*   **404 Errors**: Ensure Nginx `root` directive points to the correct build output directory (`dist` or `build`). The `try_files` directive is crucial for SPAs.
*   **Permissions**: Ensure Nginx user (usually `www-data`) has read access to your project's build files.

This README provides a comprehensive guide. Remember that the specifics of your build process (how `process.env.API_KEY` is handled) are key to the Gemini API integration working correctly.
If you are not using a build tool that performs this replacement, the application's Gemini functionality will not work as intended when deployed as static files.
