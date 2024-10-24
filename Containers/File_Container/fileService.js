const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
const path = require('path');
const multer = require('multer');
const fs = require('fs');
app.use(express.json());

const CODES_DIRECTORY = '/usr/src/app/codes/';

app.post('/save-code', (req, res) => {
    const { codePath, codeBody } = req.body;

    if (!codePath || !codeBody) {
        return res.status(400).send('Invalid request: codePath or codeBody is missing.');
    }

    const directory = path.dirname(codePath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFile(codePath, codeBody, (err) => {
        if (err) {
            console.error('Error saving the file:', err);
            return res.status(500).send('Failed to save the code:'+err.message+','+err.cause);
        }
        res.send('Code saved successfully');
    });
});

app.get('/get-code/:id', (req, res) => {
    const codeID = req.params.id;

    fs.readdir(CODES_DIRECTORY, (err, files) => {
        if (err) {
            console.error('Error reading the directory:', err);
            return res.status(500).send('Failed to read the directory.');
        }

        // const matchedFile = files.find(file => file.endsWith(`_${codeID}`));
        const matchedFile = files.find(file => file.match(`${codeID}`));
        if (!matchedFile) {
            return res.status(404).send('Code file not found.');
        }

        const filePath = path.join(CODES_DIRECTORY, matchedFile);

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return res.status(500).send('Failed to read the code file.');
            }
            res.send(data);
        });
    });
});

app.put('/update-code/:id', (req, res) => {
    const codeId = req.params.id;
    const {codeName, codeBody} = req.body;

    if(!codeName && !codeBody){
        return res.status(400).send('Invalid request: Either codeName or codeBody must be provided.');
    }

    fs.readdir(CODES_DIRECTORY, (err, files) => {
        if(err) {
            console.error('Error reading the directory:', err);
            return res.status(500).send('Failed to read the directory.');
        }

        // const matchedFile = files.find(file => file.endsWith(`_${codeId}`));
        const matchedFile = files.find(file => file.match(`${codeId}`));

        if(!matchedFile){
            return res.status(404).send('Code file not found.');
        }

        const oldFilePath = path.join(CODES_DIRECTORY, matchedFile);
        // const oldCodeName = matchedFile.split('_')[0];
        // const newFileName = `${codeName || oldCodeName}_${codeId}`;
        // const newFilePath = path.join(CODES_DIRECTORY, newFileName);

        // if(codeName && codeName !== oldCodeName){
        //     fs.rename(oldFilePath, newFilePath, (renameErr) => {
        //         if(renameErr){
        //             console.error('Error renaming the file:', renameErr);
        //             return res.status(500).send('Failed to rename the file.');
        //         }

        //         if(codeBody) {
        //             fs.writeFile(newFilePath, codeBody, (writeErr) => {
        //                 if(writeErr){
        //                     console.error('Error writing new code body:', writeErr);
        //                     return res.status(500).send('Failed to update the code body.');
        //                 }
        //                 return res.send('Code name and body updated successfully.');
        //             });
        //         } else {
        //             return res.send('Code name updated successfully.');
        //         }
        //     });   
        // }
         if (codeBody) {
            fs.writeFile(oldFilePath, codeBody, (writeErr) => {
                if (writeErr) {
                    console.error('Error updating the code body:', writeErr);
                    return res.status(500).send('Failed to update the code body.');
                }
                return res.send('Code body updated successfully.');
            });
        }
    });
});

app.delete('/delete-code/:id', (req, res) => {
    const codeID = req.params.id;
    fs.readdir(CODES_DIRECTORY, (err, files) => {
        if(err){
            console.error('Error reading the directory', err);
            return res.status(500).send('Failed to read the directory.');
        }

        // const matchedFile = files.find(file =>file.endsWith(`_${codeID}`));
        const matchedFile = files.find(file => file.match(`${codeID}`));
        if (!matchedFile) {
            return res.status(404).send('Code file not found.');
        }
        const filePath = path.join(CODES_DIRECTORY, matchedFile);
        fs.unlink(filePath, (err) => {
            if(err){
                console.error('Error deleting the file:', err);
                return
            }
            res.send("Code deleted succssfully");
        });
    });
});

const port = 3003;
app.listen(port, () => console.log(`File System service is running on port ${port}`));
