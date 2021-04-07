'use strict';

$('#edit_btn').on('click', edit);

function edit(){
    var x= document.getElementById('edit-form');
    if(x.style.display === 'none'){
        x.style.display= 'flex';
    }else{
        x.style.display = 'none';
    }
}
