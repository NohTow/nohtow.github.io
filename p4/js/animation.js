$("td").hover(function(){
	var nb = $(this).attr("data-column");
	
	var elems = getElementsByDataColumn(nb);
	for (var i = 0 ; i<elems.length ; i++){
		elems[i].style.filter="drop-shadow(3px 6px 10px black)";
	}
},
function(){
	var nb = $(this).attr("data-column");
	var elems = getElementsByDataColumn(nb);
	for (var i = 0 ; i<elems.length ; i++){
		elems[i].style.filter="";
	}
});

getElementsByDataColumn = function(className, elmt)
{
   var selection = new Array();
   var regex = new RegExp("\\b" + className + "\\b");

   // le second argument, facultatif
   if(!elmt)
      elmt = document;
   else if(typeof elmt == "string")
      elmt = document.getElementById(elmt);
   
   // on sélectionne les éléments ayant la bonne classe
   var elmts = elmt.getElementsByTagName("*");
   for(var i=0; i<elmts.length; i++)
      if(regex.test(elmts[i].getAttribute("data-column")))
         selection.push(elmts[i]);

   return selection;
}

iaPlay = function(etat){
	//var cpyEtat = jQuery.extend({},etat);
	var tab =[];
	for (var i = 0 ; i< etat.n ; i++){
		tab[i]=[]
		for (var j = 0 ; j<etat.m ; j++){
			if(etat.dom_plateau[i][j].className=="") tab[i][j]=0;
			else if(etat.dom_plateau[i][j].className=="joueur1") tab[i][j] = 1;
			else tab[i][j] = 2;
		}
	}
	p4.play(Mcts.simulate(tab));
	
	
}
simulate = function(tab){
	for(var k = 0 ; k<40 ; k++){
		var temp = [];
		for (var i = 0 ; i< etat.n ; i++){
		temp[i]=[];
		temp[i]=jQuery.extend(true,{},tab[i]);
		}
		
	}
	
}



