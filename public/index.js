var list = document.getElementsByTagName("li");
var i;
for (i = 0; i < list.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  list[i].appendChild(span);
}
var close = document.getElementsByClassName("close");
var i;

for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
    deleteTodoFromBackend(div.textContent.trim());
  }
}

document.querySelector("button").addEventListener("click", handle);
document.addEventListener("keydown",function (event) {
    if (event.key=== 'Enter'){
        handle();
    }
})

function toggleTodoCompletion(todoText, isCompleted) {
  fetch(`/api/todoscomplete`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ todo: todoText, completed: isCompleted }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Todo updated successfully:', data); 
    // Optionally update UI or display success message
  })
  .catch(error => {
    console.error('Error updating todo:', error);
    // Handle error display or retry logic
  });
}

document.addEventListener("click", function(event) {
    if (event.target.tagName === 'LI') {
      event.target.classList.toggle("checked");
      const completed = event.target.classList.contains("checked") ? 1 : 0;
      toggleTodoCompletion(event.target.textContent, completed);
    }
}); 

document.addEventListener('DOMContentLoaded',()=>{


  if(navigator.geolocation){
    // alert("gotit");
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else{
    console.log("geolocation not supported by browser");
  }


  function errorCallback(error) {
    alert("Error getting current position:", error);
  }


  function successCallback( position){
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const apikey='';
    fetch(`http://api.weatherapi.com/v1/current.json?key=${apikey}&q=${latitude},${longitude}`, {
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      return response.json();
    })
    .then(data => {
      const value=data.current.condition.text;
      const code=data.current.condition.code;
  
      fetch('/api/weatherData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({code}),
      })
      .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data=> {
        const iconUrl = data.iconUrl;
        const dataContainer = document.querySelector('.img');
        dataContainer.innerHTML = `<img src="${iconUrl}" alt="Weather Icon">`;
        document.querySelector('.text').innerHTML=`<h1>${value}</h1>`;
      })
      .catch(error => {
        console.error('Error:', error);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      // Handle error display or retry logic
    });
  }

  fetch('/api/todos').then (response =>{
    if(!response.ok){
      throw new Error ('Network response was not ok');
    }
    return response.json();
  })

  .then(todos=>{
    const todoList = document.getElementById('UL');
    todos.forEach(todo => {
      var li = document.createElement("li");
      var t = document.createTextNode(todo.todo);
      li.appendChild(t);

      var span = document.createElement("SPAN");
      var txt = document.createTextNode("\u00D7");
      span.className = "close";
      span.appendChild(txt);
      li.appendChild(span);

      if(todo.completed === 1){
        li.classList.add('checked')
      }

      span.onclick = function() {
        li.style.display = 'none';
        deleteTodoFromBackend(li.textContent.trim());
      };

      todoList.appendChild(li);

    });
  })
  .catch(error => {
    console.error('Error fetching todos:', error);
    // Handle error display or retry logic
  });




});

function deleteTodoFromBackend(todoText) {
  fetch('/api/delete-todo', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ todott: todoText }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Todo deleted successfully from backend:', data);
  })
  .catch(error => {
    console.error('Error deleting todo from backend:', error);
  });
}



function handle (){
    const todoInput = document.getElementById("todo").value;

    var li = document.createElement("li");
    var t = document.createTextNode(todoInput);
    li.appendChild(t);
    if (todoInput === '') {
      alert("You must write something!");
    } else {
      document.getElementById("UL").appendChild(li);
    }


    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
          var div = this.parentElement;
          div.style.display = "none";
          deleteTodoFromBackend(div.textContent.trim());
        }
    }  

    const todoData = {
      todo: todoInput,
      completed: 0,
    };
    
    fetch('/api/submit-form', { // Adjust endpoint URL as needed
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    })

}
