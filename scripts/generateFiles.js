const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const CsvReadableStream = require('csv-reader');
// const csvWriter = createCsvWriter({
//     header: [
//         {id: 'description', title: 'Description'},
//         {id: 'title', title: 'Title'},
//         {id: 'link', title: 'Link'},
//         {id: 'iconURL', title: 'IconURL'},
//         {id: 'icon', title: 'Icon'},
//         {id: 'filePath', title: 'FilePath'},
//     ],
//     path: 'file.csv'
// });

const outputDir = "../content/"
const separator = "---\n"
const generateFiles = fileStructure => {
    fileStructure.map(file=>{
        try {
            fs.mkdirSync(outputDir + file.dir, { recursive: true });
        } catch (ex) {
            console.log(ex)
        }
        
        const outputFilePath = outputDir + file.dir + "/" + file.fileName
        const outputFile = yaml.dump(file.yamlItem, {
            'styles': {
              '!!null': 'canonical' // dump null as ~
            },
            'sortKeys': true,        // sort object keys
            'lineWidth': 10000,
          })
        const formattedFile = separator + outputFile + separator;
        fs.writeFile(outputFilePath, formattedFile, result => {
            console.log("File written:" + outputFilePath)
        })
    });
}
const parseRow = row => {
    const description = row[0]
    const category = row[1];
    const subcategory = row[2];
    const title = row[3]
    const link = row[4]
    const iconURL = row[5]
    const icon = row[6]
    const filePath = row[7]
    const parsedPath = path.parse(filePath)
    const fileName = parsedPath.base
    const outputYaml = {
        draft: false
    }
    if (fileName == "_index.md") {
        outputYaml.layout = "resourcelist"
    }
    if (description != "") {
        outputYaml.description = description
    }
    if (title != "") {
        outputYaml.title = title
    }
    if (link != "") {
        outputYaml.link = link
    }
    if (iconURL != "") {
        outputYaml.iconURL = iconURL
    }
    if (icon != "") {
        outputYaml.icon = icon
    }
    return {
        yamlItem: outputYaml,
        category: category,
        subcategory: subcategory,
        dir: parsedPath.dir,
        fileName: parsedPath.base,
    }
}

let inputStream = fs.createReadStream('skillUp.csv', 'utf8');
let inputData = []

inputStream
    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data',  row => {
        //console.log('A row arrived: ', parseRow(row));
        inputData.push(parseRow(row))
    })
    .on('end', function (data) {
        console.log('No more rows!');
        console.log(inputData)
        generateFiles(inputData)
    });


