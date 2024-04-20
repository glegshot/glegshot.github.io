$(document).ready(function() {
	const urlParams = new URLSearchParams(window.location.search);
	const templateHTML = $.get('index.html');
	const markdownContentPath = urlParams.get('note') + ".md";

	const filePathURL = "https://api.github.com/repos/glegshot/glegshot.github.io/contents/programmingdiaries/post/" + markdownContentPath;

	if(markdownContentPath) {
		$.ajax(
			{
				url: filePathURL, 
				method: 'GET',
				headers: {
					'Accept': 'application/vnd.github.raw+json'
				},
				success: function(data) {
					fileContent = data;
					var frontMatterRegex = /^---([\s\S]*?)---/;

					var frontmatter = fileContent.match(frontMatterRegex);
					var markdownWithoutFrontMatter = fileContent;
					
					if(frontmatter) {
						var metadata = frontmatter[1];
						var splitMetaData = metadata.split(/\r\n/);
						var title = splitMetaData.find(function(splitData) {
							return splitData.includes("title");
						});
						
						title = title.split(': ');
						
						var keywords = splitMetaData.find(function(splitData) {
							return splitData.includes("keywords");
						});
						
						keywords = keywords.split(': ');
						
						$('meta[name="keywords"]').attr(keywords[1]);
						$('title').text(title[1]);
						
						markdownWithoutFrontMatter = fileContent.replace(frontMatterRegex, ''); // Remove front matter
					}
				
					var converter = new showdown.Converter();
					var htmlContent = converter.makeHtml(markdownWithoutFrontMatter);

					htmlContent = converter.makeHtml(markdownWithoutFrontMatter);
					
					$('#page-content').html(htmlContent);
			}
		});
	}
	
});