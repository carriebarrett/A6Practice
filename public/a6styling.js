// front end of A6
document.getElementById("addSubmit").addEventListener("click", colorHeadings);

function colorHeadings {
	var itemList = document.getElementsByTagName("h3");
	for (var i=0, i<itemList.length, i++){
		itemList[i].style.backgroundColor = "yellow";
	}
}