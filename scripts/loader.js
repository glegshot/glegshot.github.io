$(function(){
	const urlParams = new URLSearchParams(window.location.search);
	const fileId = urlParams.get('case')
    $("#page-content").load(fileId+".html"); 
});