# linkedin-crawler
Extract the important information from the LinkedIn 


# How to run this project
- Just download this project and extract it to your favorable folder
- After that open this folder into code editor usually `Vs Code`
- Create the new file `.env` and add the following info inside

``` Text 
  EMAIL="youremail@email.com",
  PASSWORD="yourpassword"
```

- After that open the command prompt of the Vs Code and type `npm i`
- Wait for the download to complete
- Please note that you need `NodeJs`. If you do not have NodeJs installed on your computer then follow [this](https://nodejs.org/en/) link to download
- Once Completed then add all your link inside the `src/URLS.json`
- Next just open the command line tool of vs code and type `ts-node src/index.ts` 
- Wait for the extraction to complete. Once completed then you will have your information inside the `data.json` file
- Use any online tools that convert JSON to Excel to get your excel file
