const fs = require('fs');
const yamlFront = require('yaml-front-matter');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    header: [
        {id: 'description', title: 'Description'},
        {id: 'title', title: 'Title'},
        {id: 'link', title: 'Link'},
        {id: 'iconURL', title: 'IconURL'},
        {id: 'icon', title: 'Icon'},
        {id: 'filePath', title: 'FilePath'},
    ],
    path: 'file.csv'
});
var glob = require("glob");
 
const parseFilePath = filePath => {
    folderPath = filePath.replace("../content/","")
    return folderPath
}

const parseFiles = filePaths => {
    var frontMatter =  [];
    var results = filePaths.reduce((accumulator, filePath, index)=>{
        var frontMatterItem = parseFrontMatter(filePath)
        frontMatterItem.filePath = parseFilePath(filePath)
        accumulator.push(frontMatterItem);
        return accumulator
    }, frontMatter)
    csvWriter.writeRecords(frontMatter)
    .then(() => {
        console.log('...Done');
    });
    return frontMatter
}

const getFilePathsFromGlob = globExpression => {
    glob(globExpression, null, function (err, files) {
        if (err) console.error(err);
        parseFiles(files)
    })
}

const parseFrontMatter = filePath => {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    frontMatter = yamlFront.loadFront(fileContents);
    return frontMatter
}

getFilePathsFromGlob("../content/**/*.md")

