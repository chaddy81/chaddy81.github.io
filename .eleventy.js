module.exports = function (eleventyConfig) {
  // Passthrough copy for CNAME (GitHub Pages custom domain)
  eleventyConfig.addPassthroughCopy({ CNAME: "CNAME" });

  // Filter: Calculate stagger delay for animations
  eleventyConfig.addFilter("staggerDelay", function (index) {
    return 60 + index * 50;
  });

  // Filter: Format date for display
  eleventyConfig.addFilter("postDate", function (dateObj) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const date = new Date(dateObj);
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  });

  // Collection: Posts sorted by date (newest first)
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => {
      return new Date(b.data.date) - new Date(a.data.date);
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
