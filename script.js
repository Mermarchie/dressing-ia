let clothes =
JSON.parse(
localStorage.getItem("clothes")
) || [];


let likedOutfits =
JSON.parse(
localStorage.getItem("likedOutfits")
) || [];


let deleteMode = false;

let selectedClothes = [];





function showPage(page){


document
.querySelectorAll(".page")
.forEach(
p => p.classList.remove("active")
);



document
.getElementById(page)
.classList.add("active");


}







function save(){


localStorage.setItem(

"clothes",

JSON.stringify(clothes)

);


}








function addClothing(){



let file =
document
.getElementById("photo")
.files[0];



if(!file){

alert("Ajoute une photo 📸");

return;

}



let reader =
new FileReader();





reader.onload=function(e){



let clothing={


image:e.target.result,


name:
document
.getElementById("name")
.value || "Sans nom",



category:
document
.getElementById("category")
.value,



brand:
document
.getElementById("brand")
.value || "Sans marque",



color:
document
.getElementById("color")
.value || "Non défini",



season:
document
.getElementById("season")
.value,



worn:0,


lastWear:"Jamais"


};



clothes.push(clothing);



save();


displayClothes();



alert(
"✨ Vêtement ajouté !"
);



// NETTOYAGE DU FORMULAIRE APRÈS AJOUT

document.getElementById("photo").value = "";

document.getElementById("name").value = "";

document.getElementById("brand").value = "";

document.getElementById("color").value = "";



};



reader.readAsDataURL(file);



}









function displayClothes(){



let container =
document
.getElementById("clothes");



container.innerHTML="";



clothes.forEach((c,index)=>{


let selected =
selectedClothes.includes(index);



container.innerHTML +=`


<div class="item 
${selected ? "selected":""}">


<div 
class="select-circle 
${selected ? "checked":""}"
onclick="selectClothing(${index})">

${selected ? "✓":""}

</div>



<img src="${c.image}">



<div class="item-content">


<h3>

${c.name}

</h3>



<span class="tag">

${c.category}

</span>



<span class="tag">

${c.season}

</span>



<p>

${c.brand}

</p>



<p>

${c.color}

</p>



<p>

👕 ${c.worn} port(s)

</p>



<p>

Dernier port :

${c.lastWear}

</p>



${deleteMode ? "" :

`

<button onclick="wear(${index})">

Porter

</button>

`

}



</div>


</div>



`;



});




if(deleteMode){

document
.body
.classList.add("delete-mode");


}else{


document
.body
.classList.remove("delete-mode");


}



}









function toggleDeleteMode(){



deleteMode = !deleteMode;


selectedClothes=[];


let zone =
document
.getElementById("deleteActions");


if(zone){

zone.style.display =
deleteMode ?
"block":
"none";

}



displayClothes();



}









function selectClothing(index){



if(!deleteMode){

return;

}



if(
selectedClothes.includes(index)
){


selectedClothes =
selectedClothes.filter(
i=>i!==index
);



}else{


selectedClothes.push(index);


}



displayClothes();



}









function deleteSelected(){



if(selectedClothes.length===0){


alert(
"Sélectionne au moins un vêtement"
);


return;


}




let confirmation = confirm(

"Supprimer définitivement "
+
selectedClothes.length
+
" vêtement(s) ?"

);




if(confirmation){



clothes =
clothes.filter(

(_,index)=>

!selectedClothes.includes(index)

);



selectedClothes=[];


deleteMode=false;


save();


displayClothes();



}



}









function wear(index){


clothes[index].worn++;


clothes[index].lastWear =

new Date()

.toLocaleDateString();



save();


displayClothes();


}









function random(array){


return array[

Math.floor(

Math.random()*array.length

)

];


}









function generateOutfit(){



let tops =
clothes.filter(
c=>c.category==="Haut"
);



let pants =
clothes.filter(
c=>c.category==="Pantalon"
);



let shoes =
clothes.filter(
c=>c.category==="Chaussure"
);





if(
tops.length===0 ||
pants.length===0 ||
shoes.length===0
){


document
.getElementById("outfit")
.innerHTML =


"Ajoute un haut, un pantalon et des chaussures 👕👖👟";



return;

}



let outfit=[


random(tops),


random(pants),


random(shoes)


];



let result="";



outfit.forEach(c=>{


result +=`

<div>


<h3>${c.name}</h3>


<span class="tag">

${c.color}

</span>


</div>


`;



});



document
.getElementById("outfit")
.innerHTML=result;


document
.getElementById("daily")
.innerHTML=result;



}









function likeOutfit(){



likedOutfits.push(

new Date().toLocaleString()

);



localStorage.setItem(

"likedOutfits",

JSON.stringify(likedOutfits)

);



alert(

"❤️ L'application apprend tes goûts."

);


}






displayClothes();
