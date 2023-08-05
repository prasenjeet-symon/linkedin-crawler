## LinkedIn Crawler - Extracting Important Information

### Introduction
LinkedIn Crawler is a project designed to extract important information from LinkedIn profiles using web scraping techniques. This tool can be useful for gathering data from multiple LinkedIn profiles for various purposes, such as research, analysis, or lead generation.

### How to Run the Project
Follow the steps below to run the LinkedIn Crawler project:

1. Download the project and extract it to your preferred folder.

2. Open the folder in your preferred code editor, such as Visual Studio Code (VS Code).

3. Create a new file named `.env` in the project root and add the following information inside:
   ```
   EMAIL="youremail@email.com"
   PASSWORD="yourpassword"
   ```
   Replace `youremail@email.com` with your LinkedIn account email and `yourpassword` with your LinkedIn account password. Please ensure you provide valid credentials for the LinkedIn account you want to use for scraping.

4. Open the integrated terminal in VS Code or any command prompt tool and navigate to the project directory.

5. Run the following command to install the project dependencies:
   ```
   npm install
   ```
   This will install the required Node.js packages for the project.

6. Ensure you have Node.js installed on your computer. If not, download it from [Node.js website](https://nodejs.org/).

7. Add the LinkedIn profile URLs you want to extract information from inside the `src/URLS.json` file. Each URL should be added as a separate entry in the JSON array.

8. To start the extraction process, run the following command in the terminal:
   ```
   ts-node src/index.ts
   ```
   This command will initiate the crawling and scraping process for the LinkedIn profiles specified in the `URLS.json` file.

9. Wait for the extraction process to complete. The extracted information will be saved in the `data.json` file in the project root.

10. After the extraction is complete, you can use any online tool that converts JSON to Excel format to generate an Excel file from the `data.json` file.

### Note
- Please be aware that web scraping and automated data extraction from websites like LinkedIn may be subject to LinkedIn's terms of service and regulations. Ensure you comply with LinkedIn's policies and respect the privacy of users.

- This project is provided for educational and informational purposes only. The usage of the extracted data must comply with all applicable laws and regulations.

- Before running the project, review LinkedIn's terms of service and ensure that web scraping is allowed for your intended use case.

- It is recommended to use a dedicated LinkedIn account for web scraping purposes to avoid any potential issues with your primary LinkedIn account.

### Conclusion
LinkedIn Crawler is a powerful tool for extracting essential information from LinkedIn profiles. By following the steps outlined in this documentation, you can effectively gather data from multiple profiles and utilize it for various business or research needs.
