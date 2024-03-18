function shutDownToast(toast){
	toast.attr("class", "toast-top-right toast-remove");
	setTimeout(function(){
		toast.remove();
	}, 1000);
}