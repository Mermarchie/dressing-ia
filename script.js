let clothes = JSON.parse(
localStorage.getItem("clothes")
) || [];



let likedOutfits = JSON.parse(
localStorage.getItem("likedOutfits")
) || [];





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


let file =
document
.getElementById("photo")
.files[0];



if(!file){

alert("Ajoute une photo 📸");

return;

}



let reader = new FileReader();



reader.onload = function(e){


let clothing = {


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



};



reader.readAsDataURL(file);


}








function displayClothes(){



let container =
document
.getElementById("clothes");



container.innerHTML="";



clothes.forEach((c,index)=>{



container.innerHTML += `


<div class="item">


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




<button onclick="wear(${index})">

Porter

</button>



<button class="delete"
onclick="deleteClothing(${index})">

🗑 Supprimer

</button>



</div>


</div>


`;



});



}









function wear(index){


clothes[index].worn++;


clothes[index].lastWear =

new Date()
.toLocaleDateString();



save();


displayClothes();


}








function deleteClothing(index){


let confirmDelete = confirm(

"Supprimer ce vêtement ?"

);



if(confirmDelete){


clothes.splice(index,1);


save();


displayClothes();


}


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


"Ajoute un haut, un pantalon et des chaussures pour créer une tenue 👕👖👟";



return;


}






let outfit = [

random(tops),

random(pants),

random(shoes)

];





let html="";



outfit.forEach(c=>{


html += `


<div>


<h3>

${c.name}

</h3>


<span class="tag">

${c.color}

</span>


<br>

${c.season}


</div>


`;



});





document
.getElementById("outfit")
.innerHTML = html;



document
.getElementById("daily")
.innerHTML = html;



}




function likeOutfit(){


let outfit =
document
.getElementById("outfit")
.innerHTML;



likedOutfits.push(outfit);



localStorage.setItem(

"likedOutfits",

JSON.stringify(likedOutfits)

);



alert(

"❤️ Noté ! L'application apprend ton style."

);



}







function save(){


localStorage.setItem(

"clothes",

JSON.stringify(clothes)

);


}





displayClothes();
