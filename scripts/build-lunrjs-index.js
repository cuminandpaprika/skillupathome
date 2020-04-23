const fs = require('fs').promises;
const {promisify} = require('util');
const frontMatterParser = require('parser-front-matter');
const lunrjs = require('lunr');
const glob = require("glob");

const parse = promisify(frontMatterParser.parse.bind(frontMatterParser));

const getFilePathsFromGlob = async globExpression => {
    return glob(globExpression, null, async function (err, files) {
        if (err) console.error(err);
        const posts = await Promise.all(
            files.map(async filePath => {
              const fileContent = await fs.readFile(
                filePath,
                'utf8'
              );
              const {content, data} = await parse(fileContent);
              return {
                content: content.slice(0, 3000),
                ...data
              };
            })
        );
        const index = makeIndex(posts)
        console.log(JSON.stringify(index));
    })
}

async function loadPostsWithFrontMatter(postsDirectoryPath) {
  const postNames = await fs.readdir(postsDirectoryPath);
  const posts = await Promise.all(
    postNames.map(async fileName => {
      const fileContent = await fs.readFile(
        `${postsDirectoryPath}/${fileName}`,
        'utf8'
      );
      const {content, data} = await parse(fileContent);
      return {
        content: content.slice(0, 3000),
        ...data
      };
    })
  );
  return posts;
}



function makeIndex(posts) {
  return lunrjs(function() {
    this.ref('title');
    this.field('title');
    this.field('description');
    this.field('icon');
    this.field('iconURL')
    this.field('tags');
    posts.forEach(p => {
      this.add(p);
    });
  });
}

getFilePathsFromGlob(`../content/**/*.md`);
// async function run() {
//   getFilePathsFromGlob(`../content/resources`);
// //   const index = makeIndex(posts);
// //   console.log(JSON.stringify(index));
// }

// run()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error.stack);
//     process.exit(1);
//   });
