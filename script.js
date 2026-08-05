let clothes = JSON.parse(
localStorage.getItem("clothes")
) || [];


let likedOutfits = JSON.parse(
localStorage.getItem("likedOutfits")
) || [];


let deleteMode = false;

let selectedClothes = [];





function save(){

localStorage.setItem(
"clothes",
JSON.stringify(clothes)
);

}





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








function addClothing(){


const file =
document.getElementById("photo").files[0];


if(!file){

alert("Ajoute une photo 📸");

return;

}



const reader = new FileReader();



reader.onload = function(e){



const clothing = {


image:e.target.result,


name:
document.getElementById("name").value
||
"Sans nom",



category:
document.getElementById("category").value,



brand:
document.getElementById("brand").value
||
"Sans marque",



color:
document.getElementById("color").value
||
"Non défini",



season:
document.getElementById("season").value,



worn:0,


lastWear:"Jamais"


};



clothes.push(clothing);



save();


displayClothes();




document.getElementById("photo").value="";

document.getElementById("name").value="";

document.getElementById("brand").value="";

document.getElementById("color").value="";



alert("✨ Vêtement ajouté !");



};



reader.readAsDataURL(file);


}








function displayClothes(){


const container =
document.getElementById("clothes");



if(!container) return;



container.innerHTML="";



clothes.forEach(
(c,index)=>{



let card =
document.createElement("div");


card.className="item";



if(
selectedClothes.includes(index)
){

card.classList.add("selected");

}




card.innerHTML = `



<img src="${c.image}">



<div class="item-content">



<h3>${c.name}</h3>



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


</div>


`;





if(deleteMode){


card.onclick=function(){

selectClothing(index);

};



}



else{


let button =
document.createElement("button");


button.innerText="Porter";


button.onclick=function(){

wear(index);

};


card
.querySelector(".item-content")
.appendChild(button);



}




container.appendChild(card);



}

);



}
function toggleDeleteMode(){


deleteMode = !deleteMode;


selectedClothes=[];



const zone =
document.getElementById("deleteActions");



if(zone){

zone.style.display =
deleteMode
?
"block"
:
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



}

else{


selectedClothes.push(index);


}



displayClothes();



}









function deleteSelected(){



if(selectedClothes.length===0){


alert(
"Sélectionne un vêtement"
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




if(!confirmation){

return;

}



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









function wear(index){



if(!clothes[index]){

return;

}



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

"Ajoute un haut, un pantalon et une chaussure 👕👖👟";



return;

}





let outfit=[

random(tops),

random(pants),

random(shoes)

];




let result="";




outfit.forEach(
c=>{


result += `


<div class="card">


<h3>

${c.name}

</h3>


<p>

${c.color}

</p>


<span class="tag">

${c.season}

</span>


</div>


`;



}

);




document
.getElementById("outfit")
.innerHTML=result;



document
.getElementById("daily")
.innerHTML=result;



}








function likeOutfit(){



likedOutfits.push({

date:
new Date()
.toLocaleString()

});



localStorage.setItem(

"likedOutfits",

JSON.stringify(likedOutfits)

);



alert(

"❤️ Noté ! Tes goûts sont enregistrés."

);



}








// Chargement initial

displayClothes();
