// Import prior to `module.exports` within `.eleventy.js`
const { DateTime } = require("luxon");
const { promisify } = require("util");
const slugify = require("slugify");
const tinyHTML = require("@sardine/eleventy-plugin-tinyhtml");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const readingTime = require("eleventy-plugin-reading-time");
// table of content
const pluginTOC = require("eleventy-plugin-nesting-toc");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget("./src/assets/");
  eleventyConfig.addPlugin(tinyHTML);

  /*****************************************************************************************
   *  File PassThroughs: Tell 11ty to copy assets to the final site
   * ***************************************************************************************/

  // take everything in the static/ directory
  // and copy it to the root of your build directory
  // (e.g. static/favicon.svg to _site/favicon.svg).

  eleventyConfig.addPassthroughCopy({
    "./src/static": "/",
  });
  // copy all assets
  eleventyConfig.addPassthroughCopy("./src/assets/");
  // copy all images inside individual post folders into the _site/assets/images folder
  eleventyConfig.addPassthroughCopy({
    "./src/content/**/*.png": "/assets/images",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/content/**/*.jpg": "/assets/images",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/content/**/*.avif": "/assets/images",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/content/**/*.jpeg": "/assets/images",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/content/**/*.svg": "/assets/images",
  });
  // copy all videos inside individual post folders into a _site/assets/videos folder
  eleventyConfig.addPassthroughCopy({
    "./src/content/**/*.mp4": "/assets/videos",
  });
  // copy all documents inside individual post folders into the _site/assets/documents folder
  eleventyConfig.addPassthroughCopy({
    "./src/content/**/*.pdf": "/assets/documents",
  });

  /*****************************************************************************************
   * Filters: Tell 11ty to use custom filters
   ****************************************************************************************/

  // date formatting
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "utc",
    }).toLocaleString(DateTime.DATE_MED);
  });

  eleventyConfig.addFilter("readableDateFromISO", (ISODate) => {
    return DateTime.fromISO(ISODate).toUTC().toLocaleString(DateTime.DATE_FULL);
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "utc",
    }).toFormat("dd MM, yyyy");
  });

  //   better slug viewing
  eleventyConfig.addFilter("slug", (str) => {
    if (!str) {
      return;
    }
    return slugify(str, {
      lower: true,
      strict: true,
      remove: /["]/g,
    });
  });

  /*****************************************************************************************
   *  Plugins: Tell 11ty to use custom plugins
   *****************************************************************/

  eleventyConfig.addPlugin(syntaxHighlight, {
    alwaysWrapLineHighlights: true,
  });
  eleventyConfig.addPlugin(readingTime);
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ["h2", "h3", "h4"],
    wrapper: "nav", // Element to put around the root `ol`
    wrapperClass: "p-toc", // Class for the element around the root `ol`
    headingText: "", // Optional text to show in heading above the wrapper element
    headingTag: "h2", // Heading tag when showing heading above the wrapper element
  });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  // add IDs to the headers
  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
      .use(markdownItAnchor, {})
      .disable("code")
  );

  /*****************************************************************************************
   * Collections
   ****************************************************************/
  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  // custom filtering
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByTag("posts");
  });

  // eleventyConfig.addCollection("blog", function (collection) {
  //   return collection
  //     .getFilteredByGlob("./src/content/blog/**/*.md")
  //     .filter((item) => {
  //       return !item.data.draft && item.date <= now;
  //     })
  //     .reverse();
  // });

  /*****************************************************************************************
   *  Config: Tell 11ty to use custom config
   ****************************************************************************************/

  return {
    // When a passthrough file is modified, rebuild the pages:
    passthroughFileCopy: true,

    /* tell Eleventy that markdown files, data files and HTML files should be processed by Nunjucks. 
        That means that we can now use .html files instead of having to use .njk files */
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",

    // Set custom directories for input, output, includes, and data
    // These are the defaults. You'll need to restart your dev server for any changes in this file to take effect.
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "_site",
    },
  };
};
