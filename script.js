console.log(
"Dressing IA chargé ✨"
);



let season =
new Date().getMonth();



function getSeason(){


if(season>=5 && season<=8){

return "Été";

}

if(season>=8 && season<=10){

return "Automne";

}

if(season>=11 || season<=1){

return "Hiver";

}


return "Printemps";

}



console.log(
"Saison actuelle : "
+getSeason()
);



function likeOutfit(){


alert(
"❤️ Tenue enregistrée, l’IA apprend ton style."
);


}
